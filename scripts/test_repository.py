#!/usr/bin/env python3
"""Repository-local smoke tests for workflow/docs changes."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, cwd=ROOT, check=True)


def require_contains(path: str, needles: list[str]) -> None:
    text = (ROOT / path).read_text()
    missing = [needle for needle in needles if needle not in text]
    if missing:
        raise AssertionError(f"{path} missing: {missing}")


def main() -> int:
    run([sys.executable, "scripts/validate_sources.py"])

    for fixture in (ROOT / "fixtures").glob("*.json"):
        json.loads(fixture.read_text())
        print(f"fixture ok: {fixture.relative_to(ROOT)}")

    require_contains("sources.yml", ["official-n8n-skills", "n8n-io/skills", "using-n8n-skills"])
    require_contains("docs/scoring.md", ["relevance_score", "task-fit beats stars", "best_for_query"])
    require_contains("docs/api.md", ["POST /api/v1/route", "recommended_skills", "scripts/route_skills.py"])
    require_contains(".github/workflows/sync-official.yml", ["Validate source registry", "N8N_SYNC_WEBHOOK"])
    require_contains(".github/workflows/validate-tool.yml", ["repo_validated", "risk_reasons"])

    route = subprocess.run(
        [
            sys.executable,
            "scripts/route_skills.py",
            "build an n8n workflow with GitHub issues and Slack alerts",
            "--platform",
            "n8n",
            "--max-results",
            "3",
        ],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    )
    routed = json.loads(route.stdout)
    top = routed["recommended_skills"][0]
    if top["source_id"] != "official-n8n-skills":
        raise AssertionError(f"expected official n8n skill first, got {top}")
    names = [item["name"] for item in routed["recommended_skills"]]
    if "awesome-automation-tools" in names[:2]:
        raise AssertionError("generic stars-heavy repo outranked task-fit skills")
    if top["score_breakdown"]["relevance_score"] <= 0.75:
        raise AssertionError(f"top route has weak relevance: {top}")
    print("route ok: official n8n task-fit beats stars-heavy generic repo")

    print("all repository smoke tests passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
