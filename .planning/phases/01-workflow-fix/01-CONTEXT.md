# Phase 1: Workflow Fix - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix n8n Push to GitHub node to eliminate script workaround. The README generator workflow will push directly to GitHub without needing external scripts. This phase does NOT add new workflow capabilities — it fixes the existing broken node.

</domain>

<decisions>
## Implementation Decisions

### Fix approach
- Use HTTP Request node to call GitHub API directly (replace broken Push to GitHub node)
- Remove external script workaround from CLAUDE.md completely after fix is verified
- Claude decides: Code node vs expression helpers for base64 encoding (pick most reliable)
- Claude decides: Modify existing workflow vs create new (pick cleanest approach)

### Error handling
- Notify Discord on both success AND failure
- Claude decides: Retry logic and specific error handling approach
- Claude decides: Skip push if README unchanged (compare SHA) vs always push

### Logging/visibility
- Detailed n8n execution logs (README preview, GitHub response, timing)
- Rich Discord notifications: include tool count, commit link, timestamp
- Failure notifications include error message/code for remote diagnosis
- Clean up workflow naming and add description for better discoverability in n8n UI

### Claude's Discretion
- Base64 encoding approach (Code node vs expressions)
- Modify existing workflow vs create new
- Retry count and delay on failures
- Whether to skip push on unchanged content

</decisions>

<specifics>
## Specific Ideas

- Discord webhook already exists: `https://discord.com/api/webhooks/1463969592626909388/...`
- GitHub token in CLAUDE.md: `GITHUB_PAT_REDACTED...`
- Current workaround uses `/tmp/generate-readme.js` — this should be unnecessary after fix
- Workflow file is `docker/n8n-workflows/07-readme-generator.json`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-workflow-fix*
*Context gathered: 2026-01-23*
