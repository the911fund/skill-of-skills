# Requirements: Skill of Skills

**Defined:** 2026-01-23
**Core Value:** Surface trustworthy Claude Code tools automatically

## v1 Requirements

### Workflow Automation

- [ ] **WORK-01**: n8n Push to GitHub node works natively (no script workaround)
- [ ] **WORK-02**: Discovery pipeline runs end-to-end without manual intervention

### Discovery Filtering

- [ ] **FILT-01**: Collector filters to keep only actual Claude Code tools (skills, plugins, MCP servers)
- [ ] **FILT-02**: Collector requires 100+ stars minimum to index a repo

### Trust Scoring

- [ ] **TRST-01**: Calculate commit frequency indicator (weekly/monthly activity)
- [ ] **TRST-02**: Calculate fork-to-star ratio (flag if outside 5-20% healthy range)
- [ ] **TRST-03**: Calculate contributor diversity (count unique organizations)
- [ ] **TRST-04**: Store `trust_score` as separate database field
- [ ] **TRST-05**: Factor `trust_score` into `composite_score` calculation

### Web Application

- [ ] **WEBA-01**: Trending query has fallback when no tools have `trendingScore > 0`
- [ ] **WEBA-02**: Tool cards display trust indicators
- [ ] **WEBA-03**: Users can filter/sort tools by trust level

## v2 Requirements

### Additional Data Sources

- **DATA-01**: Context7 workflow for discovering tools from documentation
- **DATA-02**: Reddit workflow for discovering tools from r/ClaudeCode discussions

### Deployment

- **DEPL-01**: Production deployment configuration
- **DEPL-02**: Monitoring and alerting for workflow failures

## Out of Scope

| Feature | Reason |
|---------|--------|
| ML-based relevance classification | Heuristic filtering sufficient for v1 |
| User authentication | Anonymous engagement tracking works for v1 |
| Real-time updates | Batch processing (6h/2h/4h cycles) sufficient |
| Mobile app | Web-first, responsive design handles mobile |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| WORK-01 | TBD | Pending |
| WORK-02 | TBD | Pending |
| FILT-01 | TBD | Pending |
| FILT-02 | TBD | Pending |
| TRST-01 | TBD | Pending |
| TRST-02 | TBD | Pending |
| TRST-03 | TBD | Pending |
| TRST-04 | TBD | Pending |
| TRST-05 | TBD | Pending |
| WEBA-01 | TBD | Pending |
| WEBA-02 | TBD | Pending |
| WEBA-03 | TBD | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 0
- Unmapped: 12 (roadmap pending)

---
*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initial definition*
