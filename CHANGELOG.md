# Changelog

All notable changes to Skill of Skills will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.9.2] - 2026-07-14

### Changed
- **Query-level caching to cut DB load on crawled pages.** The most-crawled surfaces
  (tool profiles, guides) now cache their DB queries for an hour via `unstable_cache`, so
  repeated hits (answer-engine crawlers, humans) skip the database. Wrapped: `getToolBySlug`,
  `getGuideResult`/`getGuideSummaries`, `getStats`, `getCategories`. Rankings change on the
  daily refresh, so ≤1h staleness is well within tolerance.
  - Note: page-level ISR (`export const revalidate`) was evaluated and does **not** work in
    this deployment — a dynamic `[slug]` route needs `generateStaticParams` to engage the
    route cache, which prerenders at build time, but the docker image build has no database.
    Query-level caching achieves the same DB-load reduction while the pages stay dynamically
    rendered (no build-time DB needed). Cached values serialize dates to strings, which is
    safe here because `formatDate` and `getMaintenanceStatus` both accept `Date | string`.

## [3.9.1] - 2026-07-14

### Added
- **Structured data on tool profile pages** (`SoftwareApplication` + `BreadcrumbList`
  JSON-LD). Tool pages are the surface answer engines already cite most (the organic
  ChatGPT referrals land on `/tools/*` deep links), yet they carried no structured data.
  Quality tier/score and risk ride as `additionalProperty`; an `aggregateRating` is emitted
  only when real user ratings exist (never faked from the internal score). `lib/structured-data.ts`.
- **Internal linking into the guides** — a "Related guides" section on each tool page
  (`guidesForTool()` matches by keyword / tool type / platform, capability matches ranked
  first, and renders nothing when there's no genuine match) and an "Answer guides" strip on
  the home page. Funnels visitors from the pages answer engines cite into the answer pages.
- Canonical URL added to tool-page metadata.

### Changed
- Sitemap `lastmod` for the data-driven listing/index pages now uses the most recent tool
  update (a truthful "directory last changed" signal) instead of the request time.

### Removed
- Dead `Navigation.tsx` component (the live nav is `Header.tsx`).

## [3.9.0] - 2026-07-13

### Added
- **GEO/AEO answer guides — the demand-generation layer (distribution move #2).**
  Programmatic buyer-intent "best skills for X" pages tuned for answer engines
  (ChatGPT, Perplexity, Google AI) and search, at `/guides` + `/guides/[slug]`.
  - Each guide answers one high-intent query with a **citable answer block**, a
    quality-first **ranked evidence table** (tier / score / risk / platforms) drawn
    from live data, a hand-written **FAQ**, and a monthly freshness stamp.
  - **JSON-LD structured data** (the first on the site): FAQPage + ItemList +
    BreadcrumbList + CollectionPage, so answer engines parse the answer, ranking and
    FAQ as facts rather than scraping prose (`lib/structured-data.ts`).
  - **Agent-readable variants** at `/api/v1/guides` (index) and
    `/api/v1/guides/[slug]` (answer + ranked skills + risk levels + FAQ as JSON).
  - **12 launch guides**, config-driven (`lib/guides.ts`, trivially extensible):
    5 platform bests (Claude Code, Cursor, Codex, Windsurf, Cline), 4 net-new
    capabilities collections don't cover (documentation, git/PR, API integration,
    refactoring), and 3 **demand-capture gap pages** seeded from real zero-result
    searches (Excel, Android, TradingView) that render an honest "open gap" + submit
    CTA instead of an empty list.
  - Wired into the sitemap, llms.txt, and footer nav; cross-links to the matching
    collection hub where one exists.
  - Rationale: Phase-2's demand-data product is data-starved (0 k-anonymous search
    rows, 141 human sessions) — the binding constraint is traffic, not code. Guides
    are the unblocked, no-outbound-needed channel that generates the qualified demand
    Phase 2 needs, seeded by the exact gap data the telemetry surfaced.

## [3.8.0] - 2026-07-12

### Added
- **MCP server — agent-native access to the directory (owner decision (a),
  2026-07-12 strategy report).** Streamable-HTTP endpoint at `/api/mcp`
  (`mcp-handler` over the official SDK, stateless, no auth, read-only). Six tools:
  `search_skills` (full-text, ranked by the quality-first composite), `get_skill`
  (full profile incl. risk level + reasons), `compare_tools`, `list_collections`,
  `get_collection`, `demand_pulse` (public k-anonymous pulse only).
  - **Endorsement-risk mitigations baked in (C11):** all third-party text is
    sanitized to inert plain text (HTML/markdown/links/control+bidi chars stripped,
    length-capped); every result carries `risk_level`; discovery surfaces exclude
    high/critical-risk tools and sub-40 quality by default; install commands are
    never served; every response embeds a not-an-endorsement disclaimer; per-IP
    rate limit + `MCP_DISABLED=1` kill switch.
  - **MCP demand telemetry:** tool calls log to `interaction_events`
    (`surface='mcp'`, `is_bot=true`, salted daily-rotating session hash — no raw
    IP), so agent-side demand becomes part of the interaction dataset.
- **Registry-compatible sub-registry** at `GET /api/v0.1/servers` — the
  directory's `mcp_server` subset served in the official MCP Registry's frozen
  v0.1 list shape, with quality metadata under `_meta["io.911fund.skills/quality"]`
  (honest `version: "0.0.0"` sentinel; upstream versions are not tracked).
- llms.txt + repo README now advertise the MCP endpoint
  (`claude mcp add --transport http skill-of-skills https://skills.911fund.io/api/mcp`).
- **Web UI:** an "Agent-native — Connect over MCP" section on the home page (copy-able
  connect command + the six tools at a glance) and a persistent "MCP & llms.txt" footer
  link, so human visitors discover the endpoint too.
- **Published to the official MCP Registry** as `io.911fund.skills/directory` (remote
  streamable-http). Namespace claimed via HTTP domain proof (`/.well-known/mcp-registry-auth`
  on skills.911fund.io), so any MCP client or downstream aggregator (PulseMCP, Glama, mcp.so,
  …) that ingests the registry now surfaces the directory.

## [3.7.0] - 2026-06-18

### Added
- **Private interaction dataset — the demand-side moat (Phase 1).** Privacy-first,
  first-party behavioral telemetry that captures what users actually *do*, not just what
  the catalog contains. The single most important defensibility asset.
  - New `interaction_events` table (migration `009`) + `POST /api/v1/events` ingest
    endpoint. Captures passive signals: searches performed (with result counts →
    surfaces *demand gaps*), result clicks (surface + position), profile views & scroll
    depth, install & export actions, save/watchlist events, and per-navigation
    page-views for return-visit cohorts. Phase-2 event types (vendor claim,
    broken-install report, AI-client compatibility outcome) are reserved in the schema
    so no migration is needed later.
  - **Public "Demand pulse"** section on `/analytics` — curated, k-anonymous social proof
    (trending searches shown only at ≥5 distinct sessions, most-saved, most-installed,
    a live interactions counter). Never exposes gap-searches, CTR, funnels, or cohorts.
  - **Private admin dashboard** at `/analytics/private` (gated by `ANALYTICS_ADMIN_TOKEN`,
    timing-safe, fail-closed, `notFound()` on miss) — the full moat: search→click CTR,
    zero/low-result demand gaps, profile-depth distribution, install/save rates per tool,
    return-visit cohorts by tool/platform/task, the view→install→save funnel, platform
    breakdown, and a derived "Profile completeness" card. (The Phase-2 "reserved capture"
    placeholder for the unbuilt vendor-claim/broken-install/compat signals is withheld from
    the UI until those features ship; the query layer is kept.)
  - Client tracking via `navigator.sendBeacon` with a `getSessionId()` reusing the
    existing anonymous localStorage id; result clicks/exports captured by one delegated
    listener (`data-sos-*` attrs) so pages stay server-rendered.

### Privacy
- Anonymous-only (no PII). Raw IP is never stored; the user-agent is salted-hashed
  (`EVENT_SALT`, non-reversible) for bot/return-visit dedup only. Do-Not-Track and Global
  Privacy Control are honored (events suppressed → `204`). Bot traffic is flagged and
  excluded from all analytics. First-party Postgres only — no third-party analytics, no
  consent banner required under this posture.

### Notes
- Phase 2 (separate pass) builds the submission surfaces: vendor profile-claim flow
  (needs a verification decision — ties into the deferred Verified-tier/author-claim loop),
  broken-install reports, and AI-client compatibility outcomes.

## [3.6.0] - 2026-06-12

### Changed
- **Full front-end redesign ("Neon Command Deck")** grounded in 2026 design trends —
  retrofuturist neon-gradient palette over the existing Stitch tokens, Space Grotesk
  display type, kinetic gradient hero ("Find AI skills that actually ship."), aurora +
  blueprint-grid backdrop with floating particles, glass pill navigation with active
  states and scroll elevation, live animated stat counters, an infinite "Fresh in the
  index" ticker, staggered scroll-reveal sections, cursor-tracking spotlight cards with
  3D tilt and iridescent borders, podium rank chips (gold/silver/bronze) on /trending,
  and a numbered pipeline explainer. All motion is pure CSS keyframes + three tiny
  client components (no animation deps) and fully respects `prefers-reduced-motion`.
- Reveal system is progressive-enhancement-safe: content is visible by default, hidden
  only after a JS bootstrap signals readiness, with a 1.8s failsafe that reveals
  everything if hydration never lands.

### Added
- **Hidden easter egg** — a certain classic key sequence (hinted in the footer)
  toggles TURBO MODE: skill-emoji rain plus a site-wide neon hue shift.

## [3.5.0] - 2026-06-11

### Changed
- **Quality-first ranking is live** — composite re-weighted to quality 45 / velocity 20 /
  gravity 12 / social 10 / recency 8 / ratings 5, with reputation multiplier (official
  1.5× / known-vendor 1.25× / verified 1.15×, capped), dep-vuln penalty, quorum-gated
  ratings, and recency-decayed social. `SCORING_PROFILE=legacy` reverts at runtime.
- **`/trending` page** with week/month/all windows, 🔥 Viral / 📈 Trending momentum
  badges, and a quality floor (≥40) so trending never surfaces junk.
- **README leads with 🏆 Best of the Best and 🔥 Trending Now** sections.

### Added
- **Below-threshold demotion lifecycle** — the daily recalc stamps
  `first_fell_below_threshold_at` when a tool's quality drops below 40, clears it on
  recovery, and deactivates (reversibly) after 14 days below. Config in
  `SCORING.demotion`; pure `evaluateDemotion()` helper with tests. Closes the loop that
  let 41 sub-40 tools accumulate in the active directory.
- **`trending-recalc` offset paging** — daily recalc can now cover the whole directory
  (`{limit, offset}`), not just the top-500 by stars. Paged calls skip the digest.
- **Outbound distribution module** (`distribution.ts`) — Discord digest + X post builder,
  gated OFF by default (`OUTBOUND_DISTRIBUTION_ENABLED`); dry-run returns payloads
  without network calls.
- **migration 007** — `metrics_history.quality_score` / `trending_score` snapshot columns.
- **Categorization clarity plan** (`docs/plans/2026-06-11-001`) — terminal states,
  attempt tracking, escalation model, WF13 retry-budget fix, health-metric tripwire.

### Fixed
- **`first_fell_below_threshold_at` was missing from `schema.prisma`** — the column
  existed in the live DB but Prisma couldn't see it, so nothing ever populated it.
- **`cline` added to known vendors** (`scoring-config.ts`, `relevance-gate.ts`) — the
  Cline repo's owner is `cline`, not `cline-ai`; it was getting no reputation boost.
- **`is_official` backfilled** for 15 known-vendor repos (openai, anthropics, cline,
  continuedev, modelcontextprotocol) that predated vendor-aware official status.
- **`database/schema.sql` updated** with migration 007's columns (drift-check clean).

### Added (clarity plan implementation, same day)
- **Categorization attempt tracking** (migration 008, `categorization_attempts`) —
  every AI attempt is counted; a real category resets the counter; attempts >= 3 with
  NULL confidence is the terminal `needs_review` state (no more infinite nightly retry).
- **Model escalation** — retry passes for quality>=40 tools use `claude-sonnet-4-6`
  instead of Haiku (`ESCALATION_MODEL`).
- **Scope-aware relevance gate** — Tier-2 triage prompt now leads with "FOR a coding
  agent vs IS ITSELF an AI app?" and names the families that previously slipped through.
- **Pipeline-health tripwire** — `uncategorized_pending`/`needs_review`/
  `uncategorized_pending_pct` in `/health/pipeline/detail`; status degrades when the
  retry backlog exceeds 5% of active tools, so WF15's hourly Discord alert fires.
- **`scripts/daily-trending-recalc.sh` + host cron (04:30 UTC)** — no n8n workflow was
  calling `/api/v1/batch/trending-recalc` (WF12 inactive; the "WF14 calls it" note was
  stale), so scores/demotion/metrics-history had no scheduled driver.
- **`scripts/backfill-github-metadata.py`** — one-shot backfill: 550 active tools had
  no `last_commit_at` (UNKNOWN maintenance badges in the UI) and 547 no description;
  now 3 and 18.
- **WF13 catch-up fix staged in git** — `Get Uncategorized` LIMIT 10→50 + attempts<3
  (applies on next `deploy-n8n-workflows.sh` run).

### Operations
- **Directory scrub** — 41 active sub-40 tools deactivated (off-topic/list/prompt-dump
  noise); directory now 899 active tools, zero below the Review Required line.
- **One-time categorization drain** — all 86 uncategorized / no-confidence /
  low-confidence tools re-run through `categorize-single` with `forceRefetch`;
  21 resolved to real categories.
- **Scope scrub** — the 65 that re-declined turned out to be scope misfits (AI
  apps/platforms like dify, LobeHub, Flowise, LibreChat — not coding-agent skills).
  62 deactivated with tag `out-of-scope` (reversible); 3 in-scope skill collections
  (affaan-m/ECC, awesome-codex-skills, full-stack-skills) kept and categorized.
  Directory: 837 active tools, **zero uncategorized, zero below the quality floor**.

### Security (evening hardening, same day)
- **App-layer webhook auth RE-ENABLED** on `readme/regenerate`, `batch/quality-score`,
  `batch/trending-recalc` (401 without `x-webhook-secret`; nginx 403 remains the public
  layer). All n8n callers and the host recalc cron now send the header.
- **n8n Postgres credential repaired** — stale password caused every pg node in
  WF01/07/09/13 to fail instantly for weeks ("password authentication failed").
  Verified live post-fix (WF01 success 18:00, WF07 success 18:25).

### Changed (evening, same day)
- **WF07 rewired as a thin API caller** — it had diverged in the n8n UI into a legacy
  README generator that pushed its own (sections-less) format directly to GitHub.
  Now: schedule (every 3h at :25) → POST `readme/regenerate` with secret → Discord.
- **Six live-only workflows exported to git** (01, 07, 07-minimal, 08-notifier, 09, 10)
  — closes the WF01 source-of-truth gap; git is now authoritative for all 13.
- **WF09 weekly digest** now reports the `needs_review` count.
- **Pipeline health** gains `n8n_exec_errors_6h` — any errored n8n execution within 6h
  degrades status, so WF15 alerts on workflow failures (previously invisible).
- **Tier-0 deterministic categorization fallback** (`tier0-categorization.ts`) — applied
  only when the AI declines; high-precision keyword/file-marker rules.
- **2 dead repos deactivated** (404: error-prone-support, parruda/swarm; tag `dead-repo`).
- **CLAUDE.md scrubbed of stale AWS-era references** (hetzner1 is the only host).

## [3.4.1] - 2026-04-30

### Fixed
- **WF13 catchup branch starvation** — Score Unscored Tools and Enrichment Catch-up were gated on Split In Batches main[1] (loop-completion). The metadata loop now spans more tools than n8n can process within an exec window, so for 16 days no tools were getting catchup-scored. Catchup nodes now fire from the Daily 3AM UTC trigger directly, in parallel with the metadata loop.
- **Pipeline-health false-critical when queue runs dry** — `deriveStatus` treated a stale `last_successful_ingest_at` as critical even when the drain was running on schedule with an empty queue. Now distinguishes "ingest broken" (queue has work, drain not progressing) from "queue ran empty" (drain recent, queue zero) — the latter is healthy.
- **Schema-prisma drift from migration 004** — `tools.star_velocity_7d`, `star_velocity_30d`, `discovery_source_url`, and `relevance_confidence` existed in the live DB since v3.3 but were never added to `web/prisma/schema.prisma`. Prisma's typed client could not see them; any code wanting these fields had to fall back to raw SQL. Added now.
- **`database/schema.sql` regenerated** — the hand-written v3.1 snapshot was 318 lines and missing every migration's content (002–006). Replaced with a `pg_dump` of the live schema (~3900 lines). Fresh-env bootstraps from `schema.sql` will now match the running DB.
- **Orphan WF05 in n8n** — duplicate "05 - Tool Validator" rows from earlier imports are now deleted; canonical id is `eY69MX1JK2RgBVSHs4jj_`.

### Added
- **`scripts/check-schema-drift.sh`** — pre-deploy gate. Cross-checks SQL migrations against `schema.prisma` (enum values, column adds), the live Postgres enum, and `database/schema.sql` mtime. Wired into the CLAUDE.md rebuild runbook before `docker compose build`.
- **`scripts/sync-changelog.sh`** — copies the canonical CHANGELOG from this repo to `clawd/skill-of-skills/` and pushes to GitHub. Replaces the manual `cp + commit + push` dance.
- **Tests for env-guard, HIGH_SIGNAL_SOURCES, source=managed_agent ingest path, empty-queue health exemption** — locks in the contracts created by 3.4.0 and 3.4.1.

### Security
- **`WEBHOOK_AUTH_DISABLED=true` is hard-rejected when `NODE_ENV=production`** — defense-in-depth against a misconfigured deploy. Returns 500 (misconfigured) so the operator notices in logs, instead of silently disabling auth on every webhook endpoint. Documented in `docker/.env.example`.

### Operations
- **Workflow 15 (Pipeline Health Monitor) activated** — hourly check of `/api/v1/health/pipeline/detail` with Discord alert on `status != ok`. Was `active: false` in git despite being deployable.
- **CLAUDE.md "Active Workflows" table updated** — now lists workflows 14 and 15, and notes that 12 is intentionally inactive (superseded by `/api/v1/batch/trending-recalc` called from workflow 14).

## [3.4.0] - 2026-04-30

### Added
- **Managed-agent gap-analysis routine** — new weekly Claude Code scheduled trigger (`trig_019wCpE9FMvGzLbUykYLhHyk`, Mondays 10:00 UTC) discovers AI-coding tools the n8n pipeline structurally cannot find: LLM-grade reasoning over HN/Reddit/X/Substack threads, newly-published awesome-lists, and adaptive-query vocabulary drift. Agent produces JSON manifests and POSTs them to `/api/v1/webhook/ingest-batch` and `/api/v1/discover/adaptive-queries/apply-diff`; n8n workflow 05 validates next.
- **`managed_agent` discovery source** — new value in the `discovery_source` Postgres enum and Prisma `DiscoverySource` (migration `006-managed-agent-endpoints.sql`); now also a high-signal source that triggers AI triage at the relevance gate.
- **`source_context` attribution column** — nullable text column on `discovery_queue` carrying one-line attribution (e.g., "Show HN, 40+ points") for richer provenance.
- **`managed-agent/TEMPLATE.md`** — battle-tested template extracted from the gap-analysis routine for authoring future scheduled-trigger managed agents (design doc + prompt structure + operational checklist + anti-patterns).

### Security
- **Length-bounded attribution in `ingest-batch`** — `session_type` and `agent_model` are now capped at 64 chars each before interpolation into `discovered_by`, preventing unbounded writes from a caller holding a valid `WEBHOOK_SECRET`.
- **PII redaction guidance in TEMPLATE.md** — the recovery-manifest fallback step now warns authors to redact PII (author handles, raw post bodies, message threads) before printing to the session transcript on publish failure.
- **Anti-pattern 5 reframed as security boundary** — "don't let the agent validate its own discoveries" is now documented as a trust separation between untrusted discovery and trusted validation, not just a cost optimization.

### Tests
- Smoke test for `POST /api/v1/webhook/ingest-batch` covering `managed_agent` round-trip, source_context handling, auth rejection, length-cap behaviour, dedup, malformed-URL handling, and per-seed error isolation.

## [3.3.2] - 2026-04-11

### Security
- **SSRF hardening in `/api/v1/discover/validate-candidate`** — route now uses the shared `parseRepoUrl()` allowlist (https scheme, `github.com`/`api.github.com` only, path-shape regex, traversal checks). Previously used bare `new URL()` with no host validation, letting poisoned queue rows trigger outbound requests to arbitrary hosts with the GitHub token attached. Verified against AWS metadata, homograph, and localhost vectors.
- **Webhook auth fail-closed** — `validateWebhookSecret` now returns HTTP 500 when `WEBHOOK_SECRET` is unset instead of silently authorizing all traffic. Opt-out requires explicit `WEBHOOK_AUTH_DISABLED=true`. Comparison uses `crypto.timingSafeEqual` to close the timing side-channel.
- **Anthropic 401 reclassified as permanent** — a 401 means bad/revoked key, not credit exhaustion. Previously classified as transient, causing infinite retries for every tool in the queue when the key was invalid. 402 (credit) still retries.
- **Shell JSON injection hardening in `repair-broken-tools.sh`** — JSON bodies now built with `jq -nc --arg` instead of shell string interpolation. `jq` is a hard dependency and the script fails fast if missing.

### Reliability
- **Transient retry bounded by `MAX_RETRIES=5`** — new `discovery_queue.retry_count` column (migration 005) caps transient retry loops. After 5 requeues, a row is promoted to permanent rejection with reason `failed: transient-retry-exhausted(<stage>)`. Protects against Anthropic 529 hot-loop scenarios.
- **Anthropic SDK timeouts** — both `categorization.ts` and `relevance-gate.ts` now pass `timeout: 30_000` to the Anthropic client. Prevents ingest hangs consuming the drain's 300s budget.
- **`findUnique` after atomic claim is now try-wrapped** — a DB error between claim and row-load releases the claim back to `pending` instead of orphaning it in `processing`. Repair script's 1h sweep remains as backstop.
- **`notifyNewTool` wrapped in try-catch at call site** — protects the committed transaction from a Discord throw. Previously, a thrown notify would bubble into the outer catch and mark the queue row rejected after the tool was committed, corrupting pipeline state.
- **`/api/v1/pipeline/drain` and `/api/v1/pipeline/ingest-one` now have outer try-catch** — DB connection errors return JSON 500s instead of Next.js HTML, keeping n8n JSON parsing intact.
- **Health rejection rate excludes filter-stage rejections** — `below-star-min`, `relevance-gate`, and `no-content` are legitimate pipeline outcomes, not failures. The rate metric and stage breakdown now only count infrastructure failures (`github-fetch`, `categorize`, `db-transaction`, etc.), eliminating false-critical alerts during normal operation.

### Correctness
- **`/api/v1/discover/validate-candidate` is now a pure dry-run validator** — no longer mutates `discovery_queue.status` to `accepted`. Previously marked rows accepted without creating tool rows, orphaning them from the drain endpoint so the tool was never actually ingested. Validation results are now advisory only; admission still requires `/api/v1/pipeline/drain` or `/api/v1/pipeline/ingest-one`.
- **Slug collision handling** — ingest pipeline probes up to 5 suffixed slug variants before giving up. Previously, two repos slugifying to the same value (`foo/bar-baz` and `foo-bar/baz` → `foo-bar-baz`) permanently rejected the second one.
- **`tier1_keyword` gate distinguished from `tier1_markers`** — previously keyword admissions were reported as `tier1_markers`, making file-marker vs keyword admissions indistinguishable in observability. Now a separate gate label.
- **`aiTriage` JSON parsing wrapped in try-catch** — malformed AI responses return a safe default instead of throwing into the pipeline's error classifier (which would misclassify as permanent).
- **`categorize-single` self-fetch now passes `fileTree` to `categorizeTool`** — previously fetched the file tree but discarded it, producing lower-quality categorization on the self-fetch path.
- **`categorize-single` response confidence matches persisted state** — uncategorized rows now return `confidence: null` in the response (matching what was written to the DB), not the AI's original confidence.
- **Prisma enum safety** — replaced `as never` casts on `platform`/`primaryPlatform` with a runtime filter + `$Enums.Platform` narrowing. Adding a new platform value to `detectPlatforms` now fails type-check instead of producing runtime DB errors.
- **`IngestResult.rejectionReason` consolidated into `reason`** — single field now carries rejection reason, requeue reason, and skip sub-status. Interface docs describe the format per status.

### Tests
- 31 new tests across `ingest-pipeline`, `pipeline-health`, `relevance-gate`, and `webhook-auth` covering retry-count exhaustion, `notifyNewTool` throw contract, `findUnique`-after-claim failure, Anthropic 401-is-permanent reclassification, `tier1_keyword` gate distinction, webhook fail-closed behavior, timing-safe compare prefix attacks, and filter-rejection exclusion from health rates. **130/130 tests passing.**

### Database
- **Migration 005-pipeline-hardening.sql** — adds `discovery_queue.retry_count` (default 0) + partial index for hot-loop detection.

## [3.3.1] - 2026-04-05

### Changed
- **Virality-first scoring methodology** — composite score reweighted to 35% virality + 25% star gravity + 20% quality + 10% recency + 10% social (was 55% quality + 15% each for popularity/recency/momentum)
- **Logarithmic scaling** — all score components now use log10 normalization instead of linear caps, creating meaningful spread across orders of magnitude (1 star/day through 1,000+/day)
- **Trending score overhauled** — 50% log velocity + 25% star gravity + 15% social + 10% recency (was 40% linear velocity capped at 100/day + 30% social + 30% recency)
- **200-star minimum** — all discovery sources now enforce a 200-star minimum for admission (official vendors exempt)
- **Purged 459 sub-threshold tools** — deactivated tools below 200 stars, reducing active set from 684 to 225 quality-filtered tools
- **Seeded with 248 trending repos** — scraped GitHub Trending (daily/weekly/monthly) + GitHub search for AI repos created in last 60 days, all quality-scored and AI-categorized
- **Re-categorized 136 uncategorized tools** via Claude Haiku AI categorization
- **Final directory: 473 active tools** with avg 7,239 stars, 3.4M total stars across 10 categories

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
