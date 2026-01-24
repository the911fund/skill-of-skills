# Roadmap: Skill of Skills

## Overview

Transform the existing discovery engine into a trustworthy tool catalog by fixing workflow automation, adding intelligent filtering, implementing trust scoring, and surfacing trust indicators in the web UI. The pipeline will discover fewer but higher-quality tools, score them on health/trust metrics, and present that information to users.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Workflow Fix** - Fix n8n Push to GitHub node to eliminate script workaround (PARTIAL - workaround needed due to n8n bug)
- [ ] **Phase 2: Discovery Filtering** - Filter to only Claude Code tools with 100+ stars
- [ ] **Phase 3: Trust Scoring** - Calculate and store trust metrics for each tool
- [ ] **Phase 4: Web UI** - Display trust indicators and fix query issues
- [ ] **Phase 5: Integration** - Validate end-to-end pipeline operation

## Phase Details

### Phase 1: Workflow Fix
**Goal**: n8n workflows push to GitHub natively without external scripts
**Depends on**: Nothing (first phase)
**Requirements**: WORK-01
**Success Criteria** (what must be TRUE):
  1. User can trigger README generation from n8n UI and see it pushed to GitHub
  2. No external script files are required for README workflow
  3. Workflow execution logs show successful GitHub push without errors
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md - Add GitHub push and Discord notifications to README generator workflow (partial - n8n bug requires workaround)

### Phase 2: Discovery Filtering
**Goal**: Collector only indexes legitimate Claude Code tools with meaningful community traction
**Depends on**: Phase 1 (workflow must work to test filtered results)
**Requirements**: FILT-01, FILT-02
**Success Criteria** (what must be TRUE):
  1. Running collector returns only repos with 100+ stars
  2. Every indexed tool is actually a Claude Code skill, plugin, or MCP server (not generic tools)
  3. Re-running discovery removes or flags previously indexed tools that don't meet criteria
**Plans**: TBD

Plans:
- [ ] 02-01: Implement relevance filtering
- [ ] 02-02: Implement star threshold filtering

### Phase 3: Trust Scoring
**Goal**: Each tool has a trust score derived from commit frequency, fork ratio, and contributor diversity
**Depends on**: Phase 2 (need filtered tools to score)
**Requirements**: TRST-01, TRST-02, TRST-03, TRST-04, TRST-05
**Success Criteria** (what must be TRUE):
  1. Each tool in database has a `trust_score` value between 0-100
  2. Trust score factors in: commit frequency, fork-to-star ratio, contributor diversity
  3. Composite score calculation includes trust score as a weighted factor
  4. User can query tools ordered by trust score via database
**Plans**: TBD

Plans:
- [ ] 03-01: Implement trust metric calculations
- [ ] 03-02: Store trust score and integrate into composite score

### Phase 4: Web UI
**Goal**: Users can see and filter tools by trust level
**Depends on**: Phase 3 (need trust scores to display)
**Requirements**: WEBA-01, WEBA-02, WEBA-03
**Success Criteria** (what must be TRUE):
  1. Homepage shows tools even when no tools have trendingScore > 0
  2. Tool cards display trust indicator (badge, icon, or score)
  3. User can filter tool list by trust level (e.g., "high trust only")
  4. User can sort tools by trust score
**Plans**: TBD

Plans:
- [ ] 04-01: Fix trending query fallback
- [ ] 04-02: Add trust indicators to tool cards
- [ ] 04-03: Add trust filtering and sorting

### Phase 5: Integration
**Goal**: Entire pipeline runs end-to-end without manual intervention
**Depends on**: Phase 4 (all components must be complete)
**Requirements**: WORK-02
**Success Criteria** (what must be TRUE):
  1. Scheduled workflow discovers new tools, filters, scores, and stores them automatically
  2. README regeneration reflects newly indexed tools
  3. Web UI displays new tools with trust indicators after pipeline run
**Plans**: TBD

Plans:
- [ ] 05-01: End-to-end pipeline validation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Workflow Fix | 1/1 | Partial (workaround) | 2026-01-24 |
| 2. Discovery Filtering | 0/2 | Not started | - |
| 3. Trust Scoring | 0/2 | Not started | - |
| 4. Web UI | 0/3 | Not started | - |
| 5. Integration | 0/1 | Not started | - |

---
*Roadmap created: 2026-01-23*
