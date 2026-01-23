# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- No test framework currently configured or installed
- `package.json` does not include Jest, Vitest, or similar test runner
- No test configuration files present: no `jest.config.js`, `vitest.config.ts`, etc.

**Assertion Library:**
- Not detected

**Run Commands:**
```bash
# No test commands available
# npm test would fail - no test script in package.json
```

## Test File Organization

**Location:**
- No test files found in codebase (excluding node_modules)
- No `.test.ts`, `.spec.ts`, `.test.tsx`, or `.spec.tsx` files in `src/` directory
- Codebase has 0 test files

**Naming:**
- Not applicable

**Structure:**
- Not applicable

## Current State

**Test Coverage:**
- Zero test coverage
- No unit tests for components
- No integration tests for API routes
- No end-to-end tests

## Recommendations for Implementation

**Testing Strategy Should Include:**

**Unit Tests:**
- Test utility functions in `src/lib/utils.ts`:
  - `formatNumber()`: Test abbreviation for 1k+, fallback to toString
  - `getToolTypeIcon()`: Test all tool type mappings
  - `getRiskColor()`: Test all risk level color mappings
  - `getCategoryIcon()`: Test category icon mappings
  - `formatDate()`: Test date formatting

- Test type definitions and interfaces in `src/types/index.ts`:
  - Validate shape of Tool, Category, SearchFilters types
  - Validate PaginatedResponse structure

**Component Tests:**
- Test UI components in `src/components/ui/`:
  - `Card.tsx`: Renders children, applies className
  - `Badge.tsx`: Tests variant styles (default, success, warning, danger)
  - `Button.tsx`: Tests variants (primary, secondary, outline), sizes (sm, md, lg), forwardRef behavior
  - `Pagination.tsx`: Tests prev/next button disable states, page navigation
  - `Input.tsx` and `Select.tsx`: Test forwardRef, attribute passthrough

- Test feature components:
  - `ToolCard.tsx`: Renders tool data, links to detail page
  - `ToolDetail.tsx`: Displays all tool information
  - `TypeBadge.tsx`: Tests icon and label rendering
  - `RiskBadge.tsx`: Tests risk level styling
  - `InstallCommand.tsx`: Tests copy button behavior, clipboard API

**API Route Tests:**
- Test `src/app/api/v1/tools/route.ts`:
  - GET with filters (type, category, risk, sort)
  - Pagination (page, limit parameters)
  - Invalid parameters return 400

- Test `src/app/api/v1/tools/[slug]/route.ts`:
  - GET returns tool by slug
  - Returns 404 if not found

- Test `src/app/api/v1/submit/route.ts`:
  - POST validates required fields (repoUrl, name)
  - Returns 400 if missing required fields
  - Returns 409 if duplicate submission
  - Creates discovery queue entry

- Test `src/app/api/v1/ratings/route.ts`:
  - POST validates toolId, rating, sessionId
  - Returns 400 for invalid rating (not 1-5)
  - Upserts rating record

- Test `src/app/api/v1/comments/route.ts`:
  - GET returns approved comments for tool
  - POST validates required fields
  - Creates comment with pending status

- Test `src/app/api/v1/search/route.ts`:
  - GET validates query parameter
  - Returns 400 if query missing

**Database Query Tests:**
- Test `src/lib/queries/tools.ts`:
  - `getTools()`: Filters, sorting, pagination
  - `getToolBySlug()`: Returns tool with ratings and comments
  - `getTrendingTools()`: Returns trending tools, falls back to composite score

- Test `src/lib/queries/search.ts`:
  - `searchTools()`: Full-text search with limit

**Test Infrastructure Needed:**

1. **Install test framework:**
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom happy-dom
   ```

2. **Configuration files needed:**
   - `vitest.config.ts`: Configure test runner, environment
   - `web/src/lib/test-utils.tsx`: Create custom render function with providers

3. **Mock setup:**
   - Mock Prisma client for database tests
   - Mock Next.js router for component navigation tests
   - Mock fetch/API calls in integration tests

4. **Mock patterns to establish:**
   - Prisma database calls should be mocked
   - Next.js `useRouter()` and `useSearchParams()` should be mocked
   - Clipboard API should be mocked in InstallCommand tests

## Known Gaps

**Fragile Areas Without Tests:**
- Database query logic in `src/lib/queries/` - high risk for regressions
- API route validation and error handling - error cases not verified
- Component rendering and interaction - visual/behavioral regressions not caught
- State management in client components (Pagination, InstallCommand, engagement components)

## Suggested Testing Approach

**Phase 1: Foundation**
- Set up Vitest + React Testing Library
- Add configuration and utilities

**Phase 2: Critical Path**
- Test API routes for validation and error handling
- Test query functions for database interactions
- Test utility functions for correctness

**Phase 3: Component Coverage**
- Test UI components for rendering and variants
- Test interactive components for behavior
- Test page components for data flow

---

*Testing analysis: 2026-01-23*
