# PRD: Fix Trending Query Fallback for Homepage

## Introduction

The homepage currently displays nothing when no tools have a trendingScore > 0, resulting in a poor user experience. This PRD addresses this "quick win" issue by adding fallback logic to the trending tools query. When trending data is unavailable, the system will automatically display top tools by GitHub stars instead, ensuring the homepage always shows relevant content.

## Goals

- Ensure homepage always displays tools, regardless of trending data availability
- Implement star-based fallback when no tools have trendingScore > 0
- Maintain existing trending functionality when data is available
- Complete implementation in 2-4 hours with no database changes

## Tasks

### T-001: Analyze current trending query implementation
**Description:** Review existing code to understand how trending tools are currently queried and displayed on the homepage.

**Acceptance Criteria:**
- [ ] Located the trending tools query in codebase
- [ ] Identified where results are rendered on homepage
- [ ] Documented current query logic and thresholds
- [ ] Confirmed no database schema changes needed

### T-002: Implement fallback query logic
**Description:** Modify the trending tools query to detect empty results and fall back to fetching top tools by GitHub stars.

**Acceptance Criteria:**
- [ ] Query checks if trending results are empty (all trendingScore ≤ 0)
- [ ] Fallback query fetches top tools by `github_stars DESC`
- [ ] Returns at least 6 tools in fallback scenario
- [ ] Preserves existing trending behavior when data exists
- [ ] Code includes clear comments explaining fallback logic

### T-003: Test both scenarios in browser
**Description:** Manually verify homepage displays tools correctly in both trending and fallback scenarios.

**Acceptance Criteria:**
- [ ] Test with trending data: Homepage shows tools sorted by trendingScore
- [ ] Test without trending data: Homepage shows top starred tools
- [ ] At least 6 tools visible in both scenarios
- [ ] No console errors or broken UI elements
- [ ] **Verify in browser**

## Functional Requirements

- FR-1: The trending tools query must check if results contain any tools with trendingScore > 0
- FR-2: When no trending tools exist, the system must automatically execute a fallback query
- FR-3: The fallback query must return tools sorted by `github_stars DESC LIMIT 6`
- FR-4: The homepage must display results from either trending or fallback query seamlessly
- FR-5: The system must not require any database schema modifications

## Non-Goals (Out of Scope)

- No changes to trending score calculation algorithm
- No database migrations or new columns
- No UI redesign or new components
- No changes to n8n workflows or data ingestion
- No admin interface for managing fallback behavior
- No caching or performance optimization beyond basic query logic

## Technical Considerations

- **Database:** PostgreSQL on port 5432, existing schema unchanged
- **Query location:** Likely in web UI backend or API endpoint serving homepage
- **Integration:** Must work with existing n8n data pipeline
- **Performance:** Simple conditional query, minimal performance impact
- **Constraint:** This is a display-layer fix only - no upstream changes

## Success Metrics

- Homepage never shows "no tools" or empty state
- Fallback activates correctly when trending data unavailable
- Manual testing confirms both scenarios work
- Implementation time: 2-4 hours
- Zero database migrations required

## Open Questions

- Should fallback be visible to users (e.g., "Top Starred Tools" vs "Trending Tools" label)?
  - **Answer:** No - keep the same section label to minimize UI changes. This is purely backend logic.
- Should fallback limit match trending limit exactly?
  - **Answer:** Yes - both should return the same number of tools for consistent UX.
