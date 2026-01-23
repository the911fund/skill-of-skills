# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- PascalCase for React components: `ToolCard.tsx`, `RiskBadge.tsx`, `InstallCommand.tsx`
- camelCase for utilities and lib files: `utils.ts`, `prisma.ts`, `tools.ts`
- camelCase for API route files: `route.ts` (inside `[slug]` directories)
- kebab-case for directories: `components/ui/`, `components/tools/`, `app/api/v1/`

**Functions:**
- camelCase for all function names: `getTools()`, `formatNumber()`, `handlePageChange()`, `getToolTypeIcon()`
- Async functions return type-declared Promises: `async function getTools(...): Promise<PaginatedResponse<Tool>>`

**Variables:**
- camelCase for constants and variables: `inter`, `searchParams`, `pageSize`, `copied`
- Record types use singular keys: `Record<string, string>` for icon/color mappings

**Types:**
- PascalCase for interface names: `Tool`, `Category`, `SearchFilters`, `ToolCardProps`, `BadgeProps`
- Suffix interface props with `Props`: `CardProps`, `PaginationProps`, `ToolDetailProps`
- Suffix extend HTML attributes interface: `ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`

## Code Style

**Formatting:**
- 2-space indentation (Next.js default)
- Single quotes for strings: `'use client'`, `'gray-100'`
- No semicolons (except `.displayName = 'Button'` for component naming)
- Trailing commas in multiline objects/arrays

**Linting:**
- ESLint with `eslint-config-next`: enabled via `"lint": "next lint"` script in `package.json`
- No explicit ESLint config file (uses Next.js defaults at `web/`)
- No Prettier config file (relies on Next.js built-in formatting)

## Import Organization

**Order:**
1. External packages: `import { NextRequest, NextResponse } from 'next/server'`
2. Internal imports from `@/` alias: `import { getTools } from '@/lib/queries/tools'`
3. Type imports: `import type { Tool, SearchFilters } from '@/types'`

**Path Aliases:**
- `@/*` resolves to `./src/*` (configured in `tsconfig.json`)
- Used consistently: `@/lib/`, `@/components/`, `@/types/`, `@/app/`

**'use client' Directive:**
- Place at top of file for client components: `'use client'` before imports
- Used in interactive components: `InstallCommand.tsx`, `Pagination.tsx`, `RatingStars.tsx`, `CommentSection.tsx`

## Error Handling

**API Routes:**
- Try-catch blocks wrap entire request handler: `try { ... } catch (error) { ... }`
- Generic error responses: `NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })`
- Validation errors return 400: `NextResponse.json({ error: 'toolId required' }, { status: 400 })`
- Duplicate/conflict errors return 409: `NextResponse.json({ error: 'This tool has already been submitted' }, { status: 409 })`
- Errors are not logged (no error details exposed to client)

**Database Queries:**
- Null-safe returns: `if (!tool) return null` in `getToolBySlug()`
- Fallback logic: See `getTrendingTools()` which falls back to composite score if no trending tools exist
- Type assertions used when Prisma schema doesn't perfectly match: `as unknown as Tool[]`

**Client Components:**
- Error logging to console: `console.error('Failed to rate:', error)` in engagement components
- No error UI/user-facing error messages observed

## Logging

**Framework:** Console logging only

**Patterns:**
- Used only in error paths: `console.error('Failed to submit comment:', error)`
- No info/debug/warn levels observed
- Minimal logging (3 instances found across entire codebase)
- Used in: `RatingStars.tsx`, `CommentSection.tsx`, `FavoriteButton.tsx`

## Comments

**When to Comment:**
- Minimal comments in codebase (none found in most files)
- Code is self-documenting through clear naming and structure

**JSDoc/TSDoc:**
- Not used in this codebase
- Type annotations serve as documentation

## Function Design

**Size:** Functions range 10-50 lines
- Utility functions are concise: `formatNumber()` is 6 lines
- Query functions handle single responsibility: `getTools()`, `getToolBySlug()`, `getTrendingTools()`
- Component functions stay focused on rendering or UI behavior

**Parameters:**
- Use destructuring for props: `function ToolCard({ tool }: ToolCardProps)`
- Request handlers use single parameter: `async function GET(request: NextRequest)`
- Optional parameters with default values: `getTrendingTools(limit = 10)`

**Return Values:**
- Functions explicitly type return values: `Promise<PaginatedResponse<Tool>>`
- React components implicitly return JSX: `export function Card({ children, className }: CardProps) { return (...) }`
- Null returns for missing data: `if (!tool) return null`

## Module Design

**Exports:**
- Named exports (no default exports): `export function ToolCard({ tool }: ToolCardProps)`
- Export const for forwardRef: `export const Button = forwardRef<HTMLButtonElement, ButtonProps>(...)`
- Single export per utility: `export function formatNumber()`, `export function getToolTypeIcon()`

**Barrel Files:**
- Not used in this codebase
- Each component imports directly from its file location

**Component Structure:**
- UI components in `src/components/ui/`: Card, Badge, Button, Input, Select, Pagination
- Feature components in domain directories: `src/components/tools/`, `src/components/engagement/`, `src/components/search/`
- Query/database logic in `src/lib/queries/`: tools.ts, search.ts, categories.ts, stats.ts

## TypeScript Patterns

**Type Assertions:**
- Used pragmatically: `as unknown as Tool[]` when Prisma doesn't match expected types
- Used for casting search params: `(searchParams.get('sort') as any) || 'score'`

**Generic Types:**
- Used for reusable structures: `PaginatedResponse<T>` with generic type parameter
- Applied to queries returning different data: `PaginatedResponse<Tool>`

## Styling

**Framework:** Tailwind CSS with TypeScript support
- All styles use Tailwind classes: `className="rounded-lg border border-gray-200 bg-white p-6"`
- No CSS modules or styled-components
- Utility function `cn()` from clsx combines classes: `cn('base-classes', className)`

**Component Styling:**
- Inline Tailwind classes in JSX
- Variant-based styling using object notation: `{ 'bg-green-100 text-green-800': variant === 'success' }`
- Props passed through via `cn()`: `cn('...base...', className)`

---

*Convention analysis: 2026-01-23*
