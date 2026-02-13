# Skill of Skills v2 — Enhancement PRD

## Overview

Skill of Skills is an autonomous discovery engine that scans GitHub hourly for Claude Code skills, plugins, MCP servers, and tools. It validates, categorizes, and indexes them into a README directory and web directory at skills.911fund.io. The pipeline runs on n8n (AWS), commits to this repo via GitHub API, and currently tracks 112 active tools across 10 categories with 655+ commits.

This PRD describes seven enhancement areas with implementation-ready specifics grounded in the actual codebase.

---

## System Architecture (Current)

```
01-Collector (n8n, schedule)
    → discovery_queue (status: pending)
        → 05-Tool Validator (n8n, hourly :10 + webhook)
            → Fetch GitHub metadata
            → Relevance gate (Claude markers, star thresholds)
            → Insert to tools table (ON CONFLICT DO NOTHING)
            → POST /api/v1/webhook/categorize-single (Claude Haiku)
            → POST /api/v1/readme/regenerate (pushes to GitHub)
            → Discord notification

12-Trending Score Recalculation (n8n, every 6 hours)
    → Recalculates composite_score for all tools
    → Triggers README regeneration

07-README Generator (n8n, hourly :25) — LEGACY, possibly redundant
```

**Stack**: n8n workflows + PostgreSQL (port 5433) + Next.js web app (port 3001), all on AWS EC2. Cloudflare in front of skills.911fund.io.

**Key files**:
- Validator workflow: `n8n-workflows/05-tool-validator.json`
- Categorization: `web/src/lib/categorization.ts`
- README generator: `web/src/app/api/v1/readme/regenerate/route.ts`
- Taxonomy config: `config/taxonomy.json`
- DB schema: `web/prisma/schema.prisma` and `database/schema.sql`
- Scoring config: `config/scoring-weights.json`

---

## Constraints

- **No new infrastructure.** Build within the existing AWS stack (n8n, PostgreSQL, Next.js). No new servers, containers, or services.
- **Refine the existing pipeline.** The discovery → validation → classification → publish cycle works. Improve its outputs.
- **Free tier APIs only.** GitHub API (5000 req/hr), VirusTotal API v3 (500 lookups/day, 4 req/min), Anthropic Haiku for classification.
- **README is auto-generated.** Change the prompts, templates, and logic in `web/src/app/api/v1/readme/regenerate/route.ts` — don't manually edit README.md.

---

## Area 1: Risk Classification

### Current State

Risk is assigned by a 6-keyword regex in the "Analyze & Classify" Code node of workflow 05:

```javascript
let riskLevel = 'low';
if (/subagent|autonomous|shell|execute|sudo|root/i.test(desc)) {
  riskLevel = 'medium';
}
```

It never assigns `high` or `critical`. The `risk_reasons` TEXT[] column exists but is always empty. The `spawns_subagents` boolean exists but is always false.

**Result**: raptor (offensive security agent) is rated Green Low. iothackbot (IoT pentesting) is Green Low. Nearly everything is Green Low.

### What Needs to Change

The validator (workflow 05) must be enhanced to:

1. **Fetch SKILL.md content** from the repo via GitHub API (new node after existing "Fetch Contents" node). Parse YAML frontmatter for `allowed-tools` field.

2. **Send structured data to Claude** (Haiku) for risk assessment. The prompt should receive:
   - Tool name and description
   - File listing from repo (already fetched)
   - SKILL.md content (if exists) including `allowed-tools`
   - Presence of install.sh, setup.sh, or similar scripts
   - README excerpt (first 2000 chars)

3. **Claude returns structured risk assessment**:
   ```json
   {
     "risk_level": "low|medium|high|critical",
     "risk_reasons": ["Requests Bash shell access via allowed-tools", "Operates autonomously without approval gates"],
     "spawns_subagents": true,
     "requires_shell": true,
     "modifies_agent_config": false
   }
   ```

4. **Store results** in existing DB columns: `risk_level`, `risk_reasons[]`, `spawns_subagents`

### Risk Signals the AI Should Detect and Weight

| Signal | Indicator | Weight |
|--------|-----------|--------|
| Shell/Bash in allowed-tools | SKILL.md frontmatter lists Bash, Shell, Exec | High |
| Autonomous operation | No human approval gates, autopilot modes | High |
| Agent memory modification | Writes to SOUL.md, MEMORY.md, .claude/ | High |
| Offensive security language | pentesting, exploit, attack, offensive | High |
| Multi-agent spawning | Spawns subagents, orchestrates swarms | Medium |
| Install scripts | install.sh, setup.sh exist in repo | Medium |
| External code execution | Fetches and runs code from URLs | High |
| Read-only tools | Only requests Read, Glob, Grep | Lowers risk |
| Anthropic official | repo_owner is "anthropics" | Lowers risk |

### Specific Misclassifications to Fix

These tools MUST be reclassified after enhancement:

| Tool | Current | Expected Minimum | Why |
|------|---------|-------------------|-----|
| raptor | Low | High | Offensive security agent, adversarial thinking, attack operations |
| iothackbot | Low | High | IoT pentesting, hybrid exploitation |
| claude-flow | Low | Medium | Multi-agent swarms, autonomous workflows |
| oh-my-claudecode | Medium | Medium+ | Autopilot mode, 32 parallel agents |
| claude-mem | Low | Medium | Modifies persistent session memory — known ClawHavoc attack vector |

### Acceptance Criteria

- [ ] At least 15 tools shift away from Green Low after reclassification
- [ ] raptor, iothackbot, claude-flow, oh-my-claudecode rated >= Medium
- [ ] `risk_reasons` populated for every tool (not empty array)
- [ ] Classification logic is auditable — signals detected are stored and visible
- [ ] If >80% of tools remain same risk level, classification is insufficient

### Files to Modify

- `n8n-workflows/05-tool-validator.json` — Add Fetch SKILL.md node, AI Risk Assessment node
- `web/src/app/api/v1/readme/regenerate/route.ts` — Display risk_reasons in README
- `web/src/components/tools/RiskBadge.tsx` — Show risk_reasons on hover/click
- `web/src/components/tools/ToolDetail.tsx` — Display full risk breakdown

---

## Area 2: Category Expansion

### Current State

10 categories defined in `config/taxonomy.json`:

| Slug | Name |
|------|------|
| official | Official |
| development | Development |
| documentation | Documentation |
| marketing | Marketing |
| productivity | Productivity |
| media | Media |
| research | Research |
| security | Security |
| integrations | Integrations |
| agents | Agents |
| uncategorized | Uncategorized |

AI categorization uses Claude Haiku via `web/src/lib/categorization.ts`. The prompt lists categories with descriptions and disambiguation rules.

~40% of active tools sit in Uncategorized — the largest section.

### New Categories to Add

| Slug | Name | Icon | Description |
|------|------|------|-------------|
| devops | DevOps & Monitoring | gear | Token trackers, cost monitors, status bars, deployment helpers. NOT about writing code (Development) or connecting platforms (Integrations). |
| editor | Editor & IDE | desktop | Neovim plugins, VSCode extensions, IDE-specific integrations. Specifically about extending a particular editor. |
| orchestration | Orchestration | network | Multi-agent coordinators, workflow harnesses, context management. Coordinates HOW agents work together, distinct from Agents (which ARE the autonomous agents). |
| learning | Learning & Guides | graduation-cap | Tutorials, mastery courses, how-to guides, tip collections that TEACH usage. Distinct from Documentation which INDEXES or LISTS. |

### Distinction Rules for AI Prompt

Add these to the categorization prompt in `web/src/lib/categorization.ts`:

- **Documentation vs Learning**: Documentation indexes, lists, catalogs, and aggregates references. Learning teaches, tutors, explains with instructional intent.
- **Agents vs Orchestration**: Agents are autonomous entities that perform tasks. Orchestration coordinates multiple agents, manages lifecycle, handles context flow between them.
- **Development vs Editor & IDE**: Development is about coding workflows broadly (testing, debugging, refactoring). Editor & IDE is specifically about extending Neovim, VSCode, JetBrains, or another specific editor.
- **Development vs DevOps & Monitoring**: Development helps you write code. DevOps & Monitoring helps you observe, measure, track, and deploy.

### Batch Re-categorization

After updating the prompt, re-run categorization on all 112 active tools by calling `POST /api/v1/webhook/categorize-single` for each. No review step — let it run.

### Acceptance Criteria

- [ ] Uncategorized drops from ~40% to <15% of total tools
- [ ] No tool placed in a new category where it clearly doesn't belong
- [ ] Category decisions are auditable (confidence + reasoning stored from Haiku response)

### Files to Modify

- `config/taxonomy.json` — Add 4 new category entries
- `database/seed.sql` — Add category INSERT statements
- `web/prisma/schema.prisma` — Ensure categories table supports new entries
- `web/src/lib/categorization.ts` — Update Haiku prompt with new categories + distinction rules
- Run Prisma migration or direct SQL to add category rows

---

## Area 3: Star Count Integrity

### Current State

Stars are fetched once during validation (workflow 05, "Fetch Repo Info" node) and stored in `tools.stars`. Never refreshed. The `metrics_history` table exists with `stars` column but is never populated.

Some tools show implausible counts: `ui-ux-pro-max-skill` 29.3k stars, `everything-claude-code` 41.4k, `claude-mem` 24.8k.

### What Needs to Change

Create a new n8n workflow: **08 - Daily Metadata Refresh**

Schedule: Daily (pick a low-traffic hour, e.g., 3:00 AM UTC)

Logic:
1. Query all active tools: `SELECT id, repo_owner, repo_name, stars FROM tools WHERE is_active = true`
2. For each tool, fetch `https://api.github.com/repos/{owner}/{repo}`
3. Compare `response.stargazers_count` to stored `stars`
4. If delta > 20%, flag for review (store in a `star_delta_flag` or log to Discord)
5. Update: `stars = new_count`, `stars_previous = old_count`, `stars_verified_at = NOW()`
6. Also fetch and store: `last_commit_at`, `open_issues_count`, releases data (for Area 5)

API budget: ~112 tools × 2-3 calls = ~336 calls/day. Well within 5000/hr limit.

### New DB Columns

```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS stars_verified_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS stars_previous INTEGER;
```

### Acceptance Criteria

- [ ] 100% of indexed tools have verified star counts within 24 hours
- [ ] Every tool displays when stars were last verified (in web UI and README)
- [ ] Tools with >20% star delta between cycles are flagged for review
- [ ] Stars verified timestamp shown in human-readable format

### Files to Modify

- New n8n workflow: `08-daily-metadata-refresh` (create in n8n UI, export to `n8n-workflows/`)
- `web/src/app/api/v1/readme/regenerate/route.ts` — Show stars_verified_at
- `web/src/components/tools/ToolDetail.tsx` — Show verification timestamp
- Database migration for new columns

---

## Area 4: Security Scanning (VirusTotal)

### Current State

Zero security scanning. No URL reputation checks, no dependency scanning, no malware detection.

### Important Limitation

VirusTotal URL scanning checks domain reputation, NOT repository contents. Since all tools are hosted on github.com (a trusted domain), URL scanning will return "clean" for virtually all tools — including genuinely malicious ones. Results should be labeled as "URL Reputation" not "Security Scan" to set honest expectations. This provides a baseline signal (catches phishing clones, non-GitHub distribution URLs) but does not replace the behavioral risk classification in Area 1.

### What Needs to Change

**Inline scanning in validator (workflow 05)**:

After fetching GitHub metadata and before the accept/reject decision, add a VirusTotal scan node:

1. Submit URL: `POST https://www.virustotal.com/api/v3/urls` with the tool's `repo_url`
   - Header: `x-apikey: {VT_API_KEY}`
   - Body: `url={encoded_repo_url}`
   - Response includes scan `id`

2. Retrieve results: `GET https://www.virustotal.com/api/v3/analyses/{id}`
   - May need a brief wait/poll for results
   - Response includes `stats.malicious`, `stats.suspicious`, `stats.harmless`

3. Store results:
   - `vt_scan_date = NOW()`
   - `vt_detection_count = stats.malicious + stats.suspicious`
   - `vt_scan_result = 'clean'` if 0 detections, `'flagged'` if any
   - `vt_scan_id = analysis_id`

4. Auto-elevate risk: If `vt_detection_count >= 1`, set `risk_level` to at least `high` regardless of behavioral classification

**One-time backfill workflow (09 - VirusTotal Backfill)**:

1. Query: `SELECT id, repo_url FROM tools WHERE is_active = true AND vt_scan_date IS NULL`
2. For each, submit to VirusTotal with rate limiting (4 req/min, 1500ms batch interval)
3. Store results same as inline
4. ~112 tools / 4 per min = ~28 minutes total

### New DB Columns

```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_date TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_detection_count INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_result TEXT DEFAULT 'unscanned';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_id TEXT;
```

### Environment Variable

Add `VT_API_KEY` to docker-compose.yml for n8n container. Restart container after adding.

### Acceptance Criteria

- [ ] 100% of indexed tools have at least one scan result
- [ ] Tools with >= 1 detection flagged with elevated risk and visible warning
- [ ] Scan dates recorded and displayed in web UI and README
- [ ] New discoveries scanned inline as part of validation pipeline
- [ ] Backfill completes for all existing 112 tools

### Files to Modify

- `n8n-workflows/05-tool-validator.json` — Add VirusTotal scan nodes (submit + retrieve)
- New n8n workflow: `09-vt-backfill` (one-time batch)
- Docker compose: Add `VT_API_KEY` env var
- `web/src/app/api/v1/readme/regenerate/route.ts` — Show scan status in README
- `web/src/components/tools/ToolDetail.tsx` — Show VT results
- Database migration for new columns

---

## Area 5: Maintenance Status

### Current State

Maintenance is computed at README render time based solely on `last_commit_at`:
- Active: commit within 3 months
- Stale: 3-12 months
- Unmaintained: >12 months

`last_commit_at` is fetched once at discovery and never updated.

### What Needs to Change

The daily metadata refresh workflow (Area 3, workflow 08) should also fetch:
- Release count and latest release date from `GET /repos/{owner}/{repo}/releases`
- Open issue count from repo metadata (`open_issues_count` field)

### New Maintenance Logic

| Status | Criteria |
|--------|----------|
| Active | Commit within 3 months |
| Stable | No commit in 3+ months BUT has tagged releases AND open_issues < 5 |
| Stale | No commit in 3-12 months AND (no releases OR open_issues >= 5) |
| Unmaintained | No commit in 12+ months AND no recent issue responses |

"Stable" is the key new status — it recognizes feature-complete tools that are done, not abandoned.

### New DB Columns

```sql
ALTER TABLE tools ADD COLUMN IF NOT EXISTS release_count INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS latest_release_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS open_issues_count INTEGER DEFAULT 0;
```

### Acceptance Criteria

- [ ] Feature-complete, healthy tools not penalized for inactivity
- [ ] Maintenance assessment uses at least 2 signals beyond last commit date
- [ ] "Stable" status available and correctly assigned
- [ ] README and web UI display the new status

### Files to Modify

- Workflow `08-daily-metadata-refresh` — Also fetch releases and issues
- `web/src/app/api/v1/readme/regenerate/route.ts` — Update maintenance logic and display
- `web/src/components/tools/ToolDetail.tsx` — Show maintenance signals
- Database migration for new columns
- Add maintenance_status enum value "stable" if using enum (check schema)

---

## Area 6: Latest Section Timestamps

### Current State

The "Latest" section in README shows recently discovered tools but no discovery date. The `discovered_at` timestamp exists in the DB for every tool.

### What Needs to Change

In `web/src/app/api/v1/readme/regenerate/route.ts`, where the Latest section is rendered, format and include `discovered_at` for each entry.

Format: Human-readable short date (e.g., "Feb 8", "Jan 30")

### Acceptance Criteria

- [ ] Every entry in Latest section shows discovery date
- [ ] Format is human-readable (e.g., "Feb 8" not ISO timestamp)
- [ ] Generated by pipeline at render time from existing `discovered_at` column

### Files to Modify

- `web/src/app/api/v1/readme/regenerate/route.ts` — Add date formatting to Latest section

---

## Area 7: Machine-Readable Access

### Current State

skills.911fund.io sits behind Cloudflare and returns 403 to bots. The web app has a fully functional REST API at `/api/v1/tools` that returns paginated JSON with all tool metadata, but it's blocked for programmatic access.

### What Needs to Change

1. **Cloudflare configuration**: Create a rule allowing bot/agent access to `/api/v1/*` routes. Have admin access to Cloudflare dashboard.

2. **llms.txt**: Add a static file at `web/public/llms.txt` describing the directory and its API endpoints:
   - Directory purpose and scope
   - Available API endpoints with brief descriptions
   - Data format overview
   - Rate limiting expectations

### Acceptance Criteria

- [ ] `/api/v1/tools` returns 200 (not 403) for programmatic clients
- [ ] `llms.txt` exists at skills.911fund.io/llms.txt
- [ ] llms.txt describes available endpoints and data format

### Files to Modify

- Cloudflare dashboard — API route bot rule
- `web/public/llms.txt` — New static file

---

## Implementation Priority

### Wave 1 — Fix What's Actively Misleading

| Area | Effort | Impact |
|------|--------|--------|
| 1. Risk Classification | Medium-High | Highest — currently providing false safety signals |
| 2. Category Expansion | Medium | High — users can't find tools |
| 6. Latest Timestamps | Trivial | Quick win — immediate clarity |

### Wave 2 — Build Trust Infrastructure

| Area | Effort | Impact |
|------|--------|--------|
| 4. Security Scanning | Medium | Critical for ecosystem trust |
| 3. Star Verification | Medium | Primary quality signal integrity |
| 5. Maintenance Status | Low-Medium | Better nuance in health signals |

### Wave 3 — Open the Platform

| Area | Effort | Impact |
|------|--------|--------|
| 7. Machine-Readable Access | Low | Enables ecosystem growth |

### Backfill (runs after Wave 1+2 deploy)

1. Batch re-categorize all 112 tools (Category expansion)
2. AI risk reclassify all 112 tools (Risk classification)
3. VirusTotal scan all 112 tools (Security scanning, ~28 min)
4. Daily metadata refresh populates stars + maintenance for all (automatic after workflow 08 is live)

---

## Database Migration Summary

All new columns on the `tools` table:

```sql
-- Star verification (Area 3)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS stars_verified_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS stars_previous INTEGER;

-- VirusTotal scanning (Area 4)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_date TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_detection_count INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_result TEXT DEFAULT 'unscanned';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS vt_scan_id TEXT;

-- Maintenance signals (Area 5)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS release_count INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS latest_release_at TIMESTAMPTZ;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS open_issues_count INTEGER DEFAULT 0;

-- Risk assessment booleans (Area 1)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS requires_shell BOOLEAN DEFAULT false;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS modifies_agent_config BOOLEAN DEFAULT false;

-- Refresh error tracking (Edge Case 5)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS refresh_error_count INTEGER DEFAULT 0;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS last_refresh_error TEXT;

-- Categorization auditability (Area 2)
ALTER TABLE tools ADD COLUMN IF NOT EXISTS category_confidence FLOAT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS category_reasoning TEXT;

-- New categories (Area 2)
INSERT INTO categories (id, name, slug, description, icon, display_order)
VALUES
  (gen_random_uuid(), 'DevOps & Monitoring', 'devops', 'Token trackers, cost monitors, status bars, deployment helpers', 'gear', 10),
  (gen_random_uuid(), 'Editor & IDE', 'editor', 'Neovim plugins, VSCode extensions, IDE-specific integrations', 'desktop', 11),
  (gen_random_uuid(), 'Orchestration', 'orchestration', 'Multi-agent coordinators, workflow harnesses, context management', 'network', 12),
  (gen_random_uuid(), 'Learning & Guides', 'learning', 'Tutorials, mastery courses, how-to guides, tip collections', 'graduation-cap', 13)
ON CONFLICT (slug) DO NOTHING;
```

---

## New n8n Workflows

| ID | Name | Schedule | Purpose |
|----|------|----------|---------|
| 13 | Daily Metadata Refresh | Daily 3:00 AM UTC | Refresh stars, commits, releases, issues for all active tools |
| 14 | VirusTotal Backfill | One-time manual trigger | Scan all existing tools through VirusTotal |

**Note:** IDs 08 and 09 are already in use by existing workflows (discord-notifier, retroactive-filter, discord-weekly).

---

## Environment Variables to Add

| Variable | Container | Purpose |
|----------|-----------|---------|
| VT_API_KEY | skill-of-skills-n8n | VirusTotal API v3 key |

**After adding**: `cd /home/ubuntu/skill-of-skills-clean/docker && sudo docker compose down && sudo docker compose up -d`

---

## Edge Cases & Handling Rules

### 1. ON CONFLICT DO NOTHING — Re-discovered Tools Never Update

**Problem**: The validator INSERT uses `ON CONFLICT slug DO NOTHING`. If a tool's description, stars, or metadata changes after initial discovery, it's never updated through the validation path.

**Handling**: Change the INSERT to `ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description, stars = EXCLUDED.stars, last_commit_at = EXCLUDED.last_commit_at, updated_at = NOW() RETURNING *`. This ensures re-discovered tools get their metadata refreshed. Already documented in MEMORY.md as a known gotcha.

### 2. Backfill Operation Sequencing

**Problem**: Batch re-categorization (112 Haiku calls), batch risk reclassification (112 Haiku calls + 112 GitHub SKILL.md fetches), and VirusTotal backfill (112 scans at 4/min) all need to run but could collide on rate limits if launched simultaneously.

**Handling**: Run backfills in this order, each completing before the next starts:
1. Categories first (cheapest — Haiku only, no GitHub fetches)
2. Risk classification second (Haiku + GitHub fetches for SKILL.md)
3. VirusTotal third (rate-limited to 4 req/min, ~28 min total)
4. Daily metadata refresh handles star/maintenance automatically once live

### 3. VirusTotal Polling Delay

**Problem**: VT scan submission returns immediately but results take 10-30 seconds. Inline scanning in the validator needs results before the accept/reject decision.

**Handling**: After submitting the URL, poll `GET /api/v3/analyses/{id}` with a 10-second wait, up to 3 retries (30 seconds max). If results aren't ready after 3 retries, store `vt_scan_result = 'pending'` and let the daily refresh or a follow-up check pick it up. Do NOT block tool acceptance indefinitely on VT response — a slow scan shouldn't prevent legitimate tools from entering the directory.

### 4. SKILL.md Fetch Failures / Missing SKILL.md

**Problem**: Many tools won't have a SKILL.md file. The AI risk assessment needs clear input regardless.

**Handling**: If SKILL.md doesn't exist (GitHub API returns 404), the AI risk prompt should explicitly state "No SKILL.md found — assess risk from description, file listing, and README only." The absence of SKILL.md is itself a data point (no declared permissions), not a blocker. Tools without SKILL.md default to assessment from available signals only.

### 5. Deleted, Renamed, or Private Repos

**Problem**: The daily metadata refresh will encounter repos that have been deleted, renamed, or made private (GitHub API returns 404 or 403).

**Handling**:
- **First 404/403**: Set a `refresh_error_count = 1` and `last_refresh_error = 'repo_not_found'`. Do NOT deactivate yet — could be a transient GitHub issue.
- **Second consecutive 404/403** (next day): Set `refresh_error_count = 2`. Still don't deactivate.
- **Third consecutive 404/403**: Deactivate the tool (`is_active = false`), set `maintenance_status = 'unmaintained'`, log reason. Notify via Discord.
- **If repo reappears**: Reset `refresh_error_count = 0` on successful fetch.

Add DB column: `refresh_error_count INTEGER DEFAULT 0`

### 6. GitHub API Rate Limit Handling

**Problem**: Daily refresh (336 calls) + validator runs + backfill operations all consume GitHub API quota.

**Handling**: The daily refresh workflow should check `X-RateLimit-Remaining` header after each batch of requests. If remaining < 500, pause until `X-RateLimit-Reset` timestamp. Log rate limit events to Discord. Schedule refresh at 3 AM UTC when validator traffic is lowest.

### 7. Category Conflicts — Tool Fits Multiple New Categories

**Problem**: Some tools could reasonably fit in both an existing and a new category (e.g., a Neovim plugin that also does orchestration).

**Handling**: The categorization prompt already returns `confidence` (0.0-1.0) and `reasoning`. Rely on the AI's primary classification. If confidence < 0.5, flag for potential review but still assign the AI's best pick. The prompt's distinction rules (documented in Area 2) should minimize ambiguity. One category per tool — no multi-category support.

---

## Cleanup

- Determine if n8n workflow 07 (README Generator) is still active. If web app `regenerate/route.ts` is the true source, deactivate workflow 07 to prevent duplicate README pushes.
- Remove or archive `templates/README.template.md` (unused Mustache template).
- Update `SECURITY.md` to reflect actual risk classification logic (currently documents aspirational features that weren't implemented).

---

## Reference Material

### Anthropic Agent Skills Spec
- Skills use SKILL.md with YAML frontmatter
- Key fields: `name`, `description`, `allowed-tools`
- `allowed-tools` values indicate system capability requests (Bash/Shell vs Read-only)
- Full spec: agentskills.io

### ClawHavoc Attack Report (Snyk, February 2026)
- Attack vectors: install scripts with malware, dependency poisoning, SOUL.md/MEMORY.md rewriting, temporal payloads, supply chain compromise of popular skills

### Free API Resources
- **GitHub API**: 5000 req/hr authenticated
- **VirusTotal API v3**: 500 lookups/day, 4 req/min (key obtained)
- **Anthropic Haiku**: Per-call pricing, used for categorization + risk assessment
