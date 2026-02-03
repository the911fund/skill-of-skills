# Changelog

All notable changes to Skill of Skills will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
