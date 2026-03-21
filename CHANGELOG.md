# Changelog

All notable changes to Skill of Skills will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
## [2.0.0] - 2026-02-10

### Added
- **AI Risk Assessment**: New tools are analyzed by Claude Haiku for risk signals (shell access, subagents, credential handling)
- **SBOM Dependency Scanning**: GitHub SBOM API checks for known CVEs in dependencies
- **Daily Metadata Refresh** (Workflow 13): Automatically updates star counts, releases, and maintenance status at 3AM UTC
- **4 new categories**: DevOps & Monitoring, Editor & IDE, Orchestration, Learning & Guides (15 total)
- **Multi-signal maintenance status**: Active (<90d), Stable (>90d + releases), Stale (90-365d, no releases), Unmaintained (>365d), Unknown
- **3-strike auto-deactivation**: Tools returning API errors on 3 consecutive daily refreshes are deactivated with Discord alert
- **Machine-readable API**: `/llms.txt` endpoint for AI agent consumption
- **Single-source taxonomy**: `config/taxonomy.json` with category keywords for AI categorization
- **9 new database columns**: stars_verified_at, stars_previous, release_count, latest_release_at, open_issues_count, refresh_error_count, category_confidence, dep_vuln_count, dep_scan_date

### Changed
- Validator workflow (05) expanded from 14 to 19 nodes with risk assessment pipeline
- Insert Tool now uses `ON CONFLICT DO UPDATE` instead of `DO NOTHING` (prevents silent pipeline breaks)
- Maintenance statuses renamed: Maintained → Stable, Inactive → Unmaintained
- Active threshold changed from 30 days to 90 days
- Categorization prompt updated with disambiguation rules for new categories
- All 134 active tools re-categorized with confidence scores

### Removed
- Deactivated Workflow 07 (README Generator) — replaced by web app API route
- Removed old maintenance thresholds (30/90/180 days)

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-03-21

### Changed
- **Complete platform revamp** — transformed from Claude Code-only firehose into curated multi-platform directory
- Replaced 15 domain-based categories with 9 use-case skill types derived from Uber's 500+ skill production lessons:
  Library & API Reference, Product Verification, Data Fetching & Analysis, Business Process Automation,
  Code Scaffolding & Templates, Code Quality & Review, CI/CD & Deployment, Runbooks, Infrastructure Operations
- New composite scoring: 60% quality + 25% popularity + 15% recency (was 100% popularity)
- AI categorization rewritten with disambiguation rules for 9 types + platform detection
- README generation updated with platform icons, quality tier badges, new Mermaid pipeline diagram

### Added
- **Multi-platform support** — Claude Code, Cursor, Codex, Windsurf, Cline
  - `platform` enum type + `tool_platforms` junction table (many-to-many)
  - Platform detection from file markers (SKILL.md, .cursorrules, AGENTS.md, .windsurfrules, .clinerules)
  - Platform filter in web UI and API
  - `cursor_rule` and `codex_agent` tool types
  - Vendor-aware `is_official` (Anthropic, Cursor, OpenAI, Cline, Codeium)
- **Quality scoring engine** (`web/src/lib/quality-scoring.ts`) — 12 structural signals, max 195 points:
  Gotchas/edge cases (+40), progressive disclosure folders (+30), trigger descriptions (+20),
  verification/safety signals (+20), code examples (+15), composability (+15), recent activity (+15),
  real usage evidence (+10), single responsibility (+10), config/persistence (+10), install instructions (+5), multi-platform (+5)
- **Quality tiers**: Curated (120+), Promising (80-119), Experimental (40-79), Review Required (<40)
- Quality breakdown card in tool detail page
- Platform filter bar on homepage
- "Sort by Quality" option in search filters
- Discovery queries for Cursor, Codex, Windsurf, Cline, cross-platform repos
- Seed sources list (alirezarezvani, ComposioHQ, Mindrally, PatrickJS, etc.)
- Relevance gate in GitHub Actions — rejects repos without platform markers

### Fixed
- `.github/workflows/` removed from `.gitignore` — workflows now sync to GitHub
- `validate-tool.yml` now detects 5 platforms instead of only Claude Code markers
- `sync-official.yml` includes vendor/platform fields
- Haiku model ID updated from deprecated `claude-3-5-haiku-20241022` to `claude-haiku-4-5-20251001`

### Removed
- Culled 272 noise tools (0-star no-markers, non-AI repos like crypto wallets, frontend frameworks, Black Friday deals)
- All tools archived to `archived_tools` table (recoverable)
- Old categories: Official, Development, Documentation, Marketing, Productivity, Media, Research, Security, Integrations, Agents, DevOps, Editor, Orchestration, Learning
- Active tools reduced from 575 to 303 curated entries
- Uncategorized rate reduced from 40% to 0%

### Database
- Migration: `003-platform-revamp.sql`
- New columns: `quality_score`, `has_gotchas`, `has_examples`, `has_progressive_disclosure`, `has_scripts`, `has_verification`, `has_config_files`, `readme_length`, `primary_platform`, `vendor`
- New table: `tool_platforms` (tool-platform many-to-many)
- New column on `discovery_queue`: `platform`
- New indexes: `idx_tools_quality`, `idx_tools_platform`

## [1.1.2] - 2026-02-02

### Security
- **Tightened tool validator to prevent low-quality/malicious entries**
  - Added 5 validation gates to `05-tool-validator.json`:
    1. Repo must exist (API response valid)
    2. Owner required (reject null/missing)
    3. Description required (minimum 10 characters)
    4. Quality threshold: 25+ stars OR 10+ stars with Claude markers OR Anthropic official
    5. Freshness check: reject repos with no commits in 12+ months
  - Purged `claude.vim` tool that entered with 0 stars, null owner, no description
  - Root cause: validator had no quality thresholds - any GitHub repo was auto-approved

### Changed
- Simplified trust system approach after code review
  - Rejected complex 3-layer architecture with X/Reddit APIs ($30/mo)
  - Implemented minimal fix: 5 validation gates in existing workflow
  - No database changes required

## [1.1.1] - 2026-02-02

### Fixed
- AI categorization "Official" category was incorrectly classifying community tools
  - Removed `'claude'` keyword from official detection (caused false positives)
  - Now uses `repo_owner` field to verify official status (must be "anthropics")
  - Added category priority order and disambiguation rules to AI prompt
- Recategorized 4 miscategorized tools:
  - `cc-marketplace` → Integrations (was Official)
  - `everything-claude-code` → Documentation (was Official)
  - `compound-engineering-plugin` → Development (was Official)
  - `claude-cookbooks` → Official with `is_official=true` (was Documentation)

## [1.1.0] - 2026-02-01

### Changed
- Removed trending section and scoring system from README and web UI
  - Trending scores were unreliable and added complexity without clear value
  - Disabled Trending Score Recalculation workflow (12)
- Simplified pipeline schedule: :10 discovery/validation, :25 publishing
- Added Mermaid pipeline diagram to README "How It Works" section

### Fixed
- AI categorization now works for new tools (was defaulting to "Uncategorized")
  - Added `ANTHROPIC_API_KEY` to web service environment
  - Added AI Categorize step to Tool Validator workflow (05)
- Discord webhook URLs in n8n workflows (was malformed `[object Object]` syntax)
- n8n HTTP access via `N8N_SECURE_COOKIE=false`
- Web container environment variables now properly include all required keys

## [1.0.0] - 2026-01-30

### Added
- Initial public release
- Automated discovery from GitHub, X/Twitter, and Reddit
- n8n workflow-based validation pipeline
- Risk assessment and scoring system
- Auto-generated README with tool index
- Discord notifications for new discoveries
- GitHub Actions for plugin sync and README updates

### Discovery Sources
- GitHub code search (SKILL.md, plugin.json, mcp.json)
- X/Twitter keyword monitoring
- Reddit r/ClaudeAI monitoring

### Tool Types Supported
- Skills (SKILL.md)
- Plugins (.claude-plugin)
- Collections (multi-skill repos)
- CLI Tools
- MCP Servers
- Prompt Packs
- Workflows
- Extensions
- Resources

---

## Versioning Note

This project uses continuous deployment. The README auto-updates daily with the latest discovered tools. For stable snapshots, see [GitHub Releases](https://github.com/the911fund/skill-of-skills/releases).
