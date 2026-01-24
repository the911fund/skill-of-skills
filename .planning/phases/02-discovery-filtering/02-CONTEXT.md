# Phase 2: Discovery Filtering - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Filter the collector to only index legitimate Claude Code tools with meaningful community traction (100+ stars). Previously indexed tools that don't meet criteria should be handled appropriately. No new discovery sources or UI changes in this phase.

</domain>

<decisions>
## Implementation Decisions

### Relevance Detection
- Use file pattern matching to identify Claude Code tools (no README-only repos)
- Must have actual integration manifest files to be indexed
- Include all MCP servers regardless of explicit Claude mention (MCP is Claude-compatible by definition)

### Star Threshold Behavior
- Hard cutoff at exactly 100 stars — no exceptions
- 30-day grace period for tools that drop below threshold after being indexed
- Track star history over time to show growth/decline trends

### Handling Demoted Tools
- Archive table for tools that fail relevance checks (not hard delete)
- Send Discord notification when tools are archived
- Auto-restore if archived tool later becomes relevant (re-discovered and passes filters)

### Filter Placement
- Apply filters retroactively to existing tools AND new discoveries
- Fail fast on GitHub API rate limits — stop discovery and retry next scheduled run

### Claude's Discretion
- Specific file patterns to check (mcp.json, package.json deps, skill.json, CLAUDE.md, etc.)
- Star count refresh frequency (balance API limits vs freshness)
- Archive table schema (what data to preserve)
- Optimal filter placement in pipeline (during vs after discovery)
- Logging verbosity for filter decisions

</decisions>

<specifics>
## Specific Ideas

- MCP servers are Claude-compatible by definition — don't require explicit Claude mention
- Grace period prevents losing good tools due to temporary star fluctuations
- Archive table allows potential restoration without losing historical data

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-discovery-filtering*
*Context gathered: 2026-01-23*
