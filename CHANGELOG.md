# Changelog

All notable changes to Skill of Skills will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0] - 2026-04-05

### Added
- **Viral repo discovery pipeline** — 6 new discovery sources beyond static GitHub search queries:
  1. **GitHub Trending scraper** (`/api/v1/discover/trending`) — daily scrape of GitHub Trending filtered by AI-coding keywords, queues candidates for validation
  2. **Awesome-list diffing** (`/api/v1/discover/awesome-lists`) — weekly diff of 10 curated lists (awesome-mcp-servers, awesome-claude-code, awesome-cursorrules, etc.), detects newly added repos
  3. **Social-first discovery** (`/api/v1/discover/social`) — extracts GitHub URLs from Hacker News, Reddit, and X/Twitter posts with engagement thresholds
  4. **Ecosystem graph discovery** (`/api/v1/discover/ecosystem`) — finds related tools via active forks, dependency graphs (MCP SDK, Anthropic SDK imports), and README backlinks
  5. **LLM-generated adaptive queries** (`/api/v1/discover/adaptive-queries`) — Claude analyzes recent discoveries to generate new search queries with 30-day expiry and auto-pruning
  6. **Adaptive relevance gate** (`/api/v1/discover/validate-candidate`) — two-tier system: Tier 1 (instant, file markers/vendors/keywords) and Tier 2 (Claude Haiku AI triage for high-signal sources)
- **Star velocity tracking** — `calculateStarVelocity()` computes stars/day from existing `stars_previous` and `starsVerifiedAt` fields
- **Trending score engine** — `calculateTrendingScore()` combines 40% star velocity + 30% social signals + 30% recency; populates the previously-empty `trendingScore` column
- **Batch trending recalculation** (`/api/v1/batch/trending-recalc`) — recalculates trending scores for all tools, records daily `metrics_history` snapshots
- **8 new discovery source enum values**: `github_trending`, `awesome_list`, `hackernews`, `social_discovery`, `dependency_graph`, `fork_analysis`, `backlink_discovery`, `adaptive_query`
- **`awesome_list_snapshots` table** — stores content hashes and repo URL arrays for diff-based detection
- **`adaptive_queries` table** — stores LLM-generated queries with expiry dates and result tracking

### Changed
- **Composite score formula updated** — now 55% quality + 15% popularity + 15% recency + **15% momentum** (was 60/25/15 with no momentum)
- **Trending sort now uses actual `trendingScore`** — was falling back to `qualityScore` since trending was never populated
- **`buildScoringUpdateData()` now accepts optional `trendingScore`** — both batch and single-tool scoring endpoints populate trending score
- **`scoring-weights.json` updated** with new composite weights and trending score component weights

### Database
- Migration: `004-viral-discovery.sql`
- New enum values on `discovery_source`: github_trending, awesome_list, hackernews, social_discovery, dependency_graph, fork_analysis, backlink_discovery, adaptive_query
- New columns on `tools`: `star_velocity_7d`, `star_velocity_30d`, `discovery_source_url`, `relevance_confidence`
- New tables: `awesome_list_snapshots`, `adaptive_queries`
- New index: `idx_tools_star_velocity`

## [3.2.0] - 2026-04-02

### Added
- **Automatic quality scoring** — new tools are scored inline during validation (Workflow 05) via `/api/v1/webhook/score-single` endpoint
- **Webhook authentication** — `score-single` and `categorize-single` endpoints now require `X-Webhook-Secret` header
- **Daily scoring catchup** — Workflow 13 (Daily Metadata Refresh) now batch-scores any unscored tools after metadata refresh
- **Quality tier in Discord notifications** — new tool alerts now include Curated/Promising/Experimental/Review Required tier
- **Rate-limit awareness** — GitHub API fetchers now detect 403/429 rate limits and surface errors instead of silently returning empty data

### Changed
- **Shared GitHub fetch helpers** — extracted `fetchGitHubContent`, `fetchFileTree`, `fetchRepoMeta` to `web/src/lib/github-fetchers.ts`, shared by batch and single-tool endpoints
- **Shared scoring update payload** — `buildScoringUpdateData()` in `quality-scoring.ts` eliminates 13-field duplication between endpoints
- **Tier thresholds consolidated** — `getTier()` moved to `quality-scoring.ts` as single source of truth; removed raw SQL CASE duplication in batch GET handler
- **Discord webhook URL** — moved from hardcoded plaintext in Workflow 05 to `$env.DISCORD_WEBHOOK_URL`
- **All 660 tools re-scored** with platform detection fix and updated scoring engine

### Fixed
- **Platform detection never ran for new tools** — empty `toolPlatforms` array was truthy, so `detectPlatforms(fileTree)` fallback never executed; now checks array length
- **GitHub fetch calls had no timeout** — bare `fetch()` could hang indefinitely; now uses 15s `AbortSignal.timeout`
- **File tree unbounded for large repos** — now truncated to 5000 entries
- **Fetch SKILL.md node referenced wrong upstream** — used `$json.repo_owner` from Fetch Contents (GitHub directory listing) instead of `$('Parse URL').first().json.owner`
- **Discord Notify node had no timeout or error handling** — Discord outage would block entire pipeline; now has 10s timeout and `onError: continueRegularOutput`

### Infrastructure
- `WEBHOOK_SECRET` env var added to `docker/.env` and `docker-compose.yml` (web + n8n)
- Workflow 05 nodes (AI Categorize, Quality Score) send `x-webhook-secret` header
- Workflow 13 calls `/api/v1/batch/quality-score` for unscored tools after metadata refresh

## [3.1.0] - 2026-03-25

### Changed
- **Quality scoring v3.1** — Scripts/Automation now worth 10 points (was 0), max score bumped to 200 (was 195)
- Quality breakdown card now shows all 12 signals organized into Content Signals and Repo Health sections
- "Best Match" sort renamed to "Composite Score" for clarity
- "Generic" platform renamed to "Cross-Platform" in filters
- All 319 active tools rescored with updated engine
- Search now returns paginated results with total count (was capped at 50, no pagination)
- SearchResults shows empty-state with browse suggestions and "Browse All Skills" CTA

### Added
- **Total quality score** with color-coded progress bar in quality breakdown card
- **Numeric score on ToolCard** — tier badge now shows score (e.g. "Curated 142")
- **Category page pagination** — was hardcoded to 50 tools with no pagination controls
- **Risk filter** in browse page (Low / Medium / High / Critical)
- **"Trending" sort option** with quality-score fallback (trending scores not yet populated)
- **"Top Quality" section** on homepage showcasing highest-scored tools
- **Search page suggestions** — empty state shows quick-link chips (MCP Servers, Top Quality, etc.)
- `offset` parameter for batch quality scoring API endpoint
- 4 new DB columns: `has_trigger_desc`, `has_composability`, `has_install_docs`, `has_single_responsibility`

### Fixed
- **Platform filter was broken** — queried `primaryPlatform` column instead of `toolPlatforms` junction table
- **Browse filters not wired** — tools page only passed `type` and `sort`, ignoring `platform`, `category`, `risk`
- **Filters now reset pagination** to page 1 on change
- `antigravity-agentic-skills` reactivated (was incorrectly `is_active = false`)
- Removed phantom type filters (`cursor_rule`, `codex_agent`) that returned 0 results
- Removed invalid submit form options (`prompt_pack`, `workflow`, `extension`)
- Submit API now validates `toolType` against allowed enum values
- Platform tagging backfilled: 60 MCP servers tagged as Cross-Platform, 18 Codex, 13 Cursor, 4 Windsurf, 2 Cline

### Database
- New columns: `has_trigger_desc`, `has_composability`, `has_install_docs`, `has_single_responsibility`
- Platform junction table backfilled with cross-platform and mention-based tagging

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
- **Quality scoring engine** (`web/src/lib/quality-scoring.ts`) — 12 structural signals, max 195 points (updated to 200 in v3.1):
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
