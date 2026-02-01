# PRD: Add Trust Indicators to Web UI Tool Cards

## Introduction

Add visual maintenance status indicators to tool cards in the skills directory web UI. Users need to quickly identify which tools are actively maintained versus potentially abandoned when browsing the directory. This feature addresses explicit user feedback requesting activity indicators and helps users make informed decisions about tool adoption.

The implementation uses existing GitHub data (last commit date) already stored in the database, requiring only frontend UI changes with no schema modifications.

## Goals

- Provide instant visual feedback on tool maintenance status
- Help users identify actively maintained vs stale tools
- Improve user trust and decision-making when browsing tools
- Complete implementation in 2-4 hours with no database changes

## Tasks

### T-001: Define maintenance status logic
**Description:** Create a utility function that categorizes tools based on their last commit date into status categories (Active, Maintained, Stale, Inactive).

**Acceptance Criteria:**
- [ ] Create status calculation function accepting `lastCommitDate` parameter
- [ ] Define status thresholds: Active (<30 days), Maintained (30-90 days), Stale (90-180 days), Inactive (>180 days)
- [ ] Function returns status label and color code
- [ ] Handle missing/null dates gracefully (default to "Unknown" status)
- [ ] Quality checks pass

### T-002: Create badge component
**Description:** Build a reusable badge component that displays maintenance status with appropriate styling.

**Acceptance Criteria:**
- [ ] Create badge component accepting status prop
- [ ] Implement color coding: green (Active), yellow (Maintained), orange (Stale), red (Inactive), gray (Unknown)
- [ ] Badge is visually consistent with existing UI design
- [ ] Badge includes hover tooltip explaining status meaning
- [ ] Quality checks pass
- [ ] Verify in browser with sample statuses

### T-003: Integrate badges into tool cards
**Description:** Add maintenance status badges to all tool cards in the web directory display.

**Acceptance Criteria:**
- [ ] Badge appears on each tool card in a consistent position
- [ ] Badge uses existing `lastCommitDate` field from database
- [ ] Status calculation runs for all displayed tools
- [ ] Badge does not break card layout or responsiveness
- [ ] Quality checks pass
- [ ] Verify in browser that all 71 tools show appropriate badges

### T-004: Add explanatory UI element
**Description:** Add a legend or info section explaining what each maintenance status means.

**Acceptance Criteria:**
- [ ] Legend/info section visible on skills directory page
- [ ] Explains all status categories and their meaning
- [ ] Includes time thresholds (e.g., "Active: Updated within 30 days")
- [ ] Does not clutter the main interface
- [ ] Quality checks pass
- [ ] Verify in browser for clarity and positioning

## Functional Requirements

- FR-1: The system must calculate maintenance status from existing `lastCommitDate` field without database queries
- FR-2: Tool cards must display a colored badge indicating maintenance status (Active/Maintained/Stale/Inactive)
- FR-3: Active tools (<30 days since last commit) must show a green badge
- FR-4: Maintained tools (30-90 days) must show a yellow badge
- FR-5: Stale tools (90-180 days) must show an orange badge
- FR-6: Inactive tools (>180 days) must show a red badge
- FR-7: Tools with missing commit dates must show a gray "Unknown" badge
- FR-8: Badge hover state must display tooltip explaining the status category
- FR-9: A legend or info section must explain status meanings and thresholds
- FR-10: Badge display must not negatively impact page load performance or responsiveness

## Non-Goals (Out of Scope)

- Database schema changes or migrations
- New API endpoints or data fetching mechanisms
- Detailed commit history or activity graphs
- Filtering or sorting tools by maintenance status
- User preferences for status thresholds
- Email notifications or alerts for status changes
- Integration with external services beyond existing GitHub data
- Status tracking over time or historical trends

## Technical Considerations

- **Existing Data:** Implementation relies on `lastCommitDate` field already present in database schema
- **Performance:** Status calculation should be client-side using data already loaded for tool cards
- **Responsive Design:** Badges must work on mobile, tablet, and desktop layouts
- **Color Accessibility:** Ensure color choices meet WCAG contrast requirements and include text labels for accessibility
- **Graceful Degradation:** Handle edge cases (null dates, future dates, invalid dates) without breaking UI

## Success Metrics

- All 71 indexed tools display appropriate maintenance status badges
- Visual verification confirms color coding is intuitive and accessible
- Page load time remains unchanged (<50ms difference)
- Zero console errors or warnings related to badge rendering
- User can understand status meaning within 5 seconds of viewing the page

## Open Questions

- Should we add a "Last Updated" timestamp alongside the badge for additional context? (Recommend: defer to future enhancement)
- Should we adjust thresholds based on tool type or category? (Recommend: use uniform thresholds initially, iterate based on feedback)
- Should we add a filter to show only "Active" or "Maintained" tools? (Recommend: defer to separate feature after validating badge usefulness)
