# Skill of Skills

## What This Is

An autonomous discovery engine for the Claude Code ecosystem. It discovers, validates, scores, and indexes tools (skills, plugins, MCP servers) that extend Claude Code capabilities, presenting them through a searchable web catalog with trust indicators.

## Core Value

Surface trustworthy Claude Code tools automatically — if a tool is legitimate and useful, users should find it without manual curation.

## Requirements

### Validated

- ✓ GitHub discovery pipeline (collector → validator → scorer) — existing
- ✓ PostgreSQL database with tools, discovery_queue, metrics tables — existing
- ✓ Next.js web catalog with browse, search, detail pages — existing
- ✓ Tool type classification (skill, plugin, mcp-server) — existing
- ✓ Risk level assessment (low, medium, high) — existing
- ✓ Composite scoring from GitHub metrics — existing
- ✓ User engagement (ratings, comments, favorites) — existing
- ✓ README generation and GitHub push (via script) — existing

### Active

- [ ] Fix n8n Push to GitHub node (no script workaround)
- [ ] Filter: only keep actual Claude Code tools (skills/plugins/MCP servers)
- [ ] Filter: require 100+ stars minimum
- [ ] Trust scoring: commit frequency (weekly/monthly activity)
- [ ] Trust scoring: fork-to-star ratio (healthy = 5-20%)
- [ ] Trust scoring: contributor diversity (multiple orgs)
- [ ] Store trust_score as separate field
- [ ] Factor trust_score into composite_score calculation
- [ ] Fix trending query fallback when no tools have trendingScore > 0

### Out of Scope

- Context7 workflow — deferred to later milestone
- Reddit workflow — deferred to later milestone
- Production deployment — deferred to later milestone
- User authentication — not needed for v1
- Real-time updates — batch processing sufficient

## Context

**Technical Environment:**
- Next.js 14 + TypeScript + Prisma + PostgreSQL
- n8n for workflow automation (Docker)
- Docker Compose orchestration
- GitHub API for discovery

**Current State:**
- Infrastructure running (Docker, DB with 11 tools)
- README generator working via script (n8n node broken)
- Credentials configured
- Codebase mapped in `.planning/codebase/`

**Known Issues:**
- n8n Push to GitHub node fails (Buffer.from() not available in expressions)
- Trending query returns empty when no trendingScore > 0
- No filtering for actual Claude Code relevance
- No minimum star threshold
- No trust/health indicators beyond basic metrics

## Constraints

- **Stack**: Must use existing n8n + Next.js + Prisma architecture
- **Data Source**: GitHub API is primary discovery source for this milestone
- **Automation**: Workflows should run unattended on schedules

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Trust score as separate field + factor into composite | Enables independent filtering while improving overall ranking | — Pending |
| 100 star minimum threshold | Filters noise, ensures minimum community validation | — Pending |
| Fix n8n node vs keep script | Native workflow is cleaner than external script dependency | — Pending |

---
*Last updated: 2026-01-23 after initialization*
