#!/usr/bin/env python3
"""Validate the public Skill of Skills source registry.

This intentionally avoids third-party YAML dependencies so GitHub Actions can run
it on a stock runner. It supports the small, flat YAML subset used by
sources.yml.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "sources.yml"

REQUIRED = {"id", "name", "type", "platform", "trust"}
ALLOWED_TYPES = {
    "official_skill_pack",
    "official_plugin_pack",
    "workflow_template",
    "discovery_query",
}
ALLOWED_TRUST = {"official", "reference", "discovered", "community"}
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]*[a-z0-9]$")
REPO_RE = re.compile(r"^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$")


def parse_sources(text: str) -> list[dict[str, object]]:
    sources: list[dict[str, object]] = []
    current: dict[str, object] | None = None
    in_sources = False
    current_list_key: str | None = None
    pending_multiline_key: str | None = None
    pending_lines: list[str] = []

    def flush_multiline() -> None:
        nonlocal pending_multiline_key, pending_lines
        if current is not None and pending_multiline_key:
            current[pending_multiline_key] = " ".join(line.strip() for line in pending_lines).strip()
        pending_multiline_key = None
        pending_lines = []

    for raw in text.splitlines():
        line = raw.rstrip("\n")
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped == "sources:":
            in_sources = True
            continue
        if not in_sources:
            continue

        if pending_multiline_key and (line.startswith("      ") or line.startswith("        ")):
            pending_lines.append(stripped)
            continue
        elif pending_multiline_key:
            flush_multiline()

        if line.startswith("  - "):
            current = {}
            sources.append(current)
            current_list_key = None
            rest = line[4:].strip()
            if rest:
                key, value = rest.split(":", 1)
                current[key.strip()] = value.strip().strip('"')
            continue

        if current is None:
            raise ValueError(f"field outside source item: {line!r}")

        if line.startswith("    ") and not line.startswith("      "):
            current_list_key = None
            if ":" not in stripped:
                raise ValueError(f"malformed field: {line!r}")
            key, value = stripped.split(":", 1)
            key = key.strip()
            value = value.strip()
            if value in {">-", "|", "|-"}:
                pending_multiline_key = key
                pending_lines = []
            elif value == "":
                current[key] = []
                current_list_key = key
            else:
                current[key] = value.strip('"')
            continue

        if line.startswith("      - "):
            if not current_list_key:
                raise ValueError(f"list item without list key: {line!r}")
            items = current.setdefault(current_list_key, [])
            if not isinstance(items, list):
                raise ValueError(f"field {current_list_key!r} is not a list")
            items.append(stripped[2:].strip().strip('"'))
            continue

        raise ValueError(f"unhandled YAML line: {line!r}")

    flush_multiline()
    return sources


def validate(sources: list[dict[str, object]]) -> list[str]:
    errors: list[str] = []
    seen: set[str] = set()
    for idx, source in enumerate(sources, 1):
        missing = REQUIRED - set(source)
        if missing:
            errors.append(f"source #{idx} missing required fields: {sorted(missing)}")
            continue
        sid = str(source["id"])
        if sid in seen:
            errors.append(f"duplicate source id: {sid}")
        seen.add(sid)
        if not ID_RE.match(sid):
            errors.append(f"invalid source id: {sid}")
        if source["type"] not in ALLOWED_TYPES:
            errors.append(f"{sid}: invalid type {source['type']!r}")
        if source["trust"] not in ALLOWED_TRUST:
            errors.append(f"{sid}: invalid trust {source['trust']!r}")
        has_repo = bool(source.get("repo"))
        has_url = bool(source.get("url"))
        has_query = bool(source.get("query"))
        if sum([has_repo, has_url, has_query]) != 1:
            errors.append(f"{sid}: must provide exactly one of repo, url, query")
        if has_repo and not REPO_RE.match(str(source["repo"])):
            errors.append(f"{sid}: repo must be owner/name, got {source['repo']!r}")
        if source["type"] == "official_skill_pack" and source["trust"] != "official":
            errors.append(f"{sid}: official skill packs must have trust=official")
    if not any(s.get("id") == "official-n8n-skills" for s in sources):
        errors.append("registry must include official-n8n-skills")
    return errors


def main() -> int:
    sources = parse_sources(SOURCES.read_text())
    errors = validate(sources)
    print(json.dumps({"source_count": len(sources), "ids": [s["id"] for s in sources], "errors": errors}, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
