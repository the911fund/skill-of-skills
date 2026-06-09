#!/usr/bin/env python3
"""Post high-trust Skill of Skills sources to the n8n sync webhook.

The GitHub Action runs this script. It fails early when the webhook is missing,
uses safe JSON encoding, and includes official n8n sources from sources.yml.
"""
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from validate_sources import parse_sources, validate  # noqa: E402

GITHUB_API = "https://api.github.com"


def request_json(url: str, token: str | None = None, timeout: int = 30):
    headers = {"Accept": "application/vnd.github.v3+json", "User-Agent": "skill-of-skills-sync"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def post_json(url: str, payload: dict, timeout: int = 30) -> None:
    data = json.dumps(payload, separators=(",", ":")).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "skill-of-skills-sync"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        if resp.status >= 300:
            raise RuntimeError(f"webhook returned HTTP {resp.status}")


def github_repo_url(repo: str) -> str:
    return f"https://github.com/{repo}"


def github_contents(repo: str, path: str, token: str | None):
    quoted = urllib.parse.quote(path.strip("/"))
    return request_json(f"{GITHUB_API}/repos/{repo}/contents/{quoted}", token=token)


def discover_repo_paths(source: dict, token: str | None) -> list[dict]:
    repo = source.get("repo")
    if not repo:
        return []
    candidates: list[dict] = []
    paths = source.get("paths") or []
    if not isinstance(paths, list):
        return candidates
    for path in paths:
        try:
            data = github_contents(str(repo), str(path), token)
        except urllib.error.HTTPError as exc:
            candidates.append({"path": str(path), "type": "missing", "error": f"HTTP {exc.code}"})
            continue
        if isinstance(data, list):
            for item in data:
                if item.get("type") in {"dir", "file"}:
                    candidates.append({
                        "path": item.get("path"),
                        "name": item.get("name"),
                        "type": item.get("type"),
                        "html_url": item.get("html_url"),
                    })
        elif isinstance(data, dict):
            candidates.append({
                "path": data.get("path"),
                "name": data.get("name"),
                "type": data.get("type"),
                "html_url": data.get("html_url"),
            })
    return candidates


def source_payload(source: dict, candidates: list[dict]) -> dict:
    repo = source.get("repo")
    url = source.get("url") or (github_repo_url(str(repo)) if repo else None)
    return {
        "source_id": source["id"],
        "name": source["name"],
        "repo_url": github_repo_url(str(repo)) if repo else None,
        "source_url": url,
        "source": "source_registry",
        "source_type": source["type"],
        "platform": source["platform"],
        "vendor": source.get("vendor"),
        "trust": source["trust"],
        "entrypoint": source.get("entrypoint"),
        "is_official": source.get("trust") == "official",
        "is_verified": source.get("trust") in {"official", "reference"},
        "paths": source.get("paths", []),
        "candidates": candidates,
        "notes": source.get("notes"),
    }


def main() -> int:
    webhook = os.environ.get("N8N_SYNC_WEBHOOK", "").strip()
    dry_run = os.environ.get("DRY_RUN", "false").lower() in {"1", "true", "yes"}
    if not webhook and not dry_run:
        print("error: N8N_SYNC_WEBHOOK is not configured; refusing to POST to an empty URL", file=sys.stderr)
        return 2
    token = os.environ.get("GITHUB_TOKEN", "").strip() or None

    sources = parse_sources((ROOT / "sources.yml").read_text())
    errors = validate(sources)
    if errors:
        for error in errors:
            print(f"error: {error}", file=sys.stderr)
        return 1

    posted = 0
    for source in sources:
        if source.get("trust") not in {"official", "reference"}:
            continue
        candidates = discover_repo_paths(source, token)
        payload = source_payload(source, candidates)
        print(json.dumps({"posting": payload["source_id"], "candidates": len(candidates)}, sort_keys=True))
        if not dry_run:
            post_json(webhook, payload)
            time.sleep(1)
        posted += 1

    print(json.dumps({"posted_sources": posted, "dry_run": dry_run}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
