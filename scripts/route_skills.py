#!/usr/bin/env python3
"""Local prototype for the proposed /api/v1/route skill router.

This script is intentionally dependency-free so GitHub Actions can exercise the
routing contract without a live backend. It encodes the product rule documented
in docs/scoring.md: task-fit beats stars.
"""
from __future__ import annotations

import argparse
import json
import math
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CANDIDATES = ROOT / "fixtures" / "route-candidates.json"

WEIGHTS = {
    "relevance_score": 0.40,
    "skill_quality_score": 0.20,
    "trust_score": 0.15,
    "maintenance_score": 0.10,
    "safety_score": 0.10,
    "installability_score": 0.05,
}

TRUST = {
    "official": 1.0,
    "verified": 0.9,
    "community": 0.65,
    "unknown": 0.25,
}

MAINTENANCE = {
    "active": 0.9,
    "recent": 0.8,
    "unknown": 0.45,
    "stale": 0.2,
}

SAFETY = {
    "low": 0.9,
    "medium": 0.75,
    "unknown": 0.45,
    "high": 0.25,
}

STOPWORDS = {
    "a",
    "an",
    "and",
    "as",
    "build",
    "create",
    "for",
    "in",
    "into",
    "of",
    "on",
    "that",
    "the",
    "to",
    "use",
    "with",
}

SYNONYMS = {
    "workflow": {"workflows", "automation", "automations"},
    "workflows": {"workflow", "automation", "automations"},
    "github": {"issues", "pull", "pr"},
    "issue": {"issues", "ticket", "tickets"},
    "issues": {"issue", "ticket", "tickets"},
    "slack": {"alerts", "notification", "notifications"},
    "alert": {"alerts", "notification", "notifications"},
    "alerts": {"alert", "notification", "notifications"},
    "review": {"pr", "pull", "diff", "comments"},
}


def tokenize(text: str) -> set[str]:
    words = {w for w in re.findall(r"[a-z0-9][a-z0-9_-]*", text.lower()) if w not in STOPWORDS}
    expanded = set(words)
    for word in words:
        expanded.update(SYNONYMS.get(word, set()))
    return expanded


def clamp(value: float) -> float:
    return max(0.0, min(1.0, value))


def relevance(task: str, candidate: dict[str, Any], requested_platforms: set[str]) -> float:
    task_terms = tokenize(task)
    haystack = " ".join(
        str(candidate.get(field, ""))
        for field in ("name", "repo", "source_id", "description", "record_granularity")
    )
    candidate_terms = tokenize(haystack)
    if not task_terms:
        return 0.0

    lexical = len(task_terms & candidate_terms) / len(task_terms)
    platforms = {str(p).lower() for p in candidate.get("platforms", [])}
    platform_fit = 0.0
    if requested_platforms:
        platform_fit = len(platforms & requested_platforms) / len(requested_platforms)
    elif platforms & task_terms:
        platform_fit = 0.25

    exact_platform_bonus = 0.15 if any(p in candidate_terms for p in requested_platforms) else 0.0
    return clamp((lexical * 0.75) + (platform_fit * 0.20) + exact_platform_bonus)


def skill_quality(candidate: dict[str, Any]) -> float:
    signals = set(candidate.get("quality_signals", []))
    base = len(signals & {"trigger", "examples", "verification", "references", "approval_gates"}) / 5
    if candidate.get("record_granularity") == "skill_level":
        base += 0.15
    elif candidate.get("record_granularity") == "repo_level":
        base -= 0.25
    if not candidate.get("description") or candidate.get("description") == "No description":
        base -= 0.2
    return clamp(base)


def installability(candidate: dict[str, Any]) -> float:
    score = 0.35
    if candidate.get("record_granularity") == "skill_level":
        score += 0.30
    if candidate.get("repo"):
        score += 0.15
    if "references" in set(candidate.get("quality_signals", [])):
        score += 0.10
    if candidate.get("platforms"):
        score += 0.10
    return clamp(score)


def popularity_tiebreak(candidate: dict[str, Any]) -> float:
    # Popularity is capped and used only after the main route score. 100k stars
    # cannot beat exact task fit by itself.
    stars = max(0, int(candidate.get("stars") or 0))
    return clamp(math.log10(stars + 1) / 6)


def score_candidate(task: str, candidate: dict[str, Any], requested_platforms: set[str]) -> dict[str, Any]:
    breakdown = {
        "relevance_score": relevance(task, candidate, requested_platforms),
        "skill_quality_score": skill_quality(candidate),
        "trust_score": TRUST.get(str(candidate.get("trust", "unknown")).lower(), 0.25),
        "maintenance_score": MAINTENANCE.get(str(candidate.get("maintenance", "unknown")).lower(), 0.45),
        "safety_score": SAFETY.get(str(candidate.get("safety", "unknown")).lower(), 0.45),
        "installability_score": installability(candidate),
    }
    score = sum(breakdown[k] * weight for k, weight in WEIGHTS.items())
    return {
        **candidate,
        "score": round(score, 4),
        "popularity_tiebreak": round(popularity_tiebreak(candidate), 4),
        "score_breakdown": {k: round(v, 4) for k, v in breakdown.items()},
    }


def route(task: str, candidates: list[dict[str, Any]], platforms: list[str] | None = None, max_results: int = 5) -> dict[str, Any]:
    requested_platforms = {p.lower() for p in (platforms or [])}
    ranked = [score_candidate(task, candidate, requested_platforms) for candidate in candidates]
    ranked.sort(
        key=lambda item: (
            item["score"],
            item["score_breakdown"]["relevance_score"],
            item["score_breakdown"]["trust_score"],
            item["popularity_tiebreak"],
        ),
        reverse=True,
    )

    recommended = []
    for index, item in enumerate(ranked[:max_results]):
        recommended.append(
            {
                "name": item["name"],
                "repo": item["repo"],
                "source_id": item.get("source_id", ""),
                "load_first": index == 0,
                "why": explain(item),
                "score": item["score"],
                "score_breakdown": item["score_breakdown"],
                "popularity_tiebreak": item["popularity_tiebreak"],
            }
        )

    warnings = []
    if any(word in tokenize(task) for word in {"credential", "credentials", "delete", "deploy", "slack", "github"}):
        warnings.append("Credentials and side-effect integrations should require explicit approval before execution.")

    return {
        "query_intent": {
            "task_terms": sorted(tokenize(task)),
            "platforms": sorted(requested_platforms),
            "risk": "medium" if warnings else "low",
        },
        "recommended_skills": recommended,
        "warnings": warnings,
    }


def explain(item: dict[str, Any]) -> str:
    parts = []
    breakdown = item["score_breakdown"]
    if breakdown["relevance_score"] >= 0.75:
        parts.append("strong task/platform fit")
    if breakdown["trust_score"] >= 0.9:
        parts.append("trusted official source")
    if item.get("record_granularity") == "skill_level":
        parts.append("skill-level record, not generic repo-level noise")
    if not parts:
        parts.append("partial match; inspect before loading")
    return "; ".join(parts) + "."


def load_candidates(path: Path) -> list[dict[str, Any]]:
    data = json.loads(path.read_text())
    if not isinstance(data, list):
        raise ValueError(f"{path} must contain a JSON list")
    return data


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Route a task to best-fit skills")
    parser.add_argument("task", help="Task description to route")
    parser.add_argument("--platform", action="append", default=[], help="Requested platform; repeatable")
    parser.add_argument("--max-results", type=int, default=5)
    parser.add_argument("--candidates", type=Path, default=DEFAULT_CANDIDATES)
    args = parser.parse_args(argv)

    result = route(args.task, load_candidates(args.candidates), args.platform, args.max_results)
    json.dump(result, sys.stdout, indent=2)
    print()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
