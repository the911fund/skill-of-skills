# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
skill-of-skills/
├── web/                           # Next.js web application (port 3001/3002)
│   ├── src/
│   │   ├── app/                   # App Router pages and API routes
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities and data access
│   │   └── types/                 # TypeScript interfaces
│   ├── prisma/
│   │   └── schema.prisma          # Database schema
│   ├── public/                    # Static assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── tailwind.config.js
├── docker/                        # Container configuration
│   ├── docker-compose.yml
│   ├── Dockerfile.web
│   ├── .env                       # Environment variables
│   └── .env.example
├── n8n-workflows/                 # n8n automation workflows
│   ├── 01-github-collector.json
│   ├── 03-x-entity-extractor.json
│   ├── 04-reddit-collector.json
│   ├── 05-validator.json
│   ├── 06-scorer.json
│   └── 07-readme-generator.json
├── database/                      # Database setup scripts
│   ├── schema.sql
│   └── seed.sql
├── config/                        # Configuration files
├── scripts/                       # Utility scripts
└── templates/                     # Template files

## Directory Purposes

**web/src/app/:**
- Purpose: Next.js App Router pages, layouts, and API routes
- Contains: Page components (.tsx), API route handlers (.ts), globals styles
- Structure:
  - `page.tsx` - Home page
  - `layout.tsx` - Root layout wrapper
  - `api/v1/` - API route handlers
  - `tools/` - Tool browsing pages
  - `categories/` - Category pages
  - `search/` - Search results page
  - `submit/` - Tool submission form
  - `analytics/` - Analytics dashboard

**web/src/components/:**
- Purpose: Reusable React components
- Contains: UI components, page-specific components, layout components
- Subdirectories:
  - `ui/` - Primitive UI components (Button, Card, Badge, Input, Select, Pagination)
  - `tools/` - Tool-specific components (ToolCard, ToolDetail, ToolGrid, TypeBadge, RiskBadge)
  - `search/` - Search components (SearchBar, SearchFilters, SearchResults)
  - `layout/` - Layout components (Header, Footer, Navigation)
  - `engagement/` - User interaction (RatingStars, FavoriteButton, CommentSection)
  - `analytics/` - Dashboard components

**web/src/lib/:**
- Purpose: Utilities and data access layer
- Contains:
  - `prisma.ts` - Prisma client singleton
  - `utils.ts` - Helper functions (formatNumber, formatDate, icon mapping)
  - `queries/` - Database query functions
    - `tools.ts` - Tool queries (getTools, getToolBySlug, getTrendingTools)
    - `categories.ts` - Category queries (getCategories, getCategoryBySlug)
    - `search.ts` - Search queries
    - `stats.ts` - Statistics queries

**web/src/types/:**
- Purpose: TypeScript type definitions
- Contains: `index.ts` with interfaces for Tool, Category, SearchFilters, PaginatedResponse, Stats

**web/prisma/:**
- Purpose: Database schema and ORM configuration
- Contains: `schema.prisma` with models, enums, and migrations

**docker/:**
- Purpose: Containerization and local development setup
- Contains:
  - `docker-compose.yml` - Multi-service orchestration
  - `Dockerfile.web` - Next.js container build
  - `.env` / `.env.example` - Environment configuration
  - Services: web (Next.js), n8n (workflow automation), postgres (database)

**n8n-workflows/:**
- Purpose: Scheduled discovery, validation, and scoring automation
- Contains: JSON workflow definitions
  - `01-github-collector.json` - Discovers tools from GitHub
  - `03-x-entity-extractor.json` - Extracts tool mentions from X/Twitter
  - `04-reddit-collector.json` - Discovers tools from Reddit
  - `05-validator.json` - Validates discovered tools
  - `06-scorer.json` - Calculates composite scores
  - `07-readme-generator.json` - Generates README (use script instead per CLAUDE.md)

**database/:**
- Purpose: Database initialization scripts
- Contains: SQL schemas and seed data

## Key File Locations

**Entry Points:**

- `web/src/app/page.tsx` - Home page (GET /)
- `web/src/app/layout.tsx` - Root layout with Header/Footer
- `web/src/app/tools/page.tsx` - Browse tools page
- `web/src/app/api/v1/tools/route.ts` - Tools API (GET /api/v1/tools)
- `docker/docker-compose.yml` - Service orchestration
- `docker/Dockerfile.web` - Web app container build

**Configuration:**

- `web/tsconfig.json` - TypeScript configuration with `@/*` path alias
- `web/next.config.js` - Next.js config (standalone output, strict mode)
- `web/prisma/schema.prisma` - Prisma database schema
- `docker/.env` - Environment variables for services
- `web/tailwind.config.js` - Tailwind CSS configuration

**Core Logic:**

- `web/src/lib/queries/tools.ts` - Tool query logic with filtering, sorting, pagination
- `web/src/lib/queries/categories.ts` - Category queries
- `web/src/types/index.ts` - Domain types (Tool, Category, SearchFilters)
- `web/src/components/tools/ToolDetail.tsx` - Tool detail component with rich UI
- `web/src/app/api/v1/submit/route.ts` - Tool submission endpoint

**Utilities:**

- `web/src/lib/utils.ts` - Shared helpers (formatNumber, formatDate, icon getters)
- `web/src/lib/prisma.ts` - Prisma singleton with dev mode optimization

**Styling:**

- `web/src/app/globals.css` - Global styles
- `web/tailwind.config.js` - Tailwind configuration
- Components use `clsx` via `cn()` utility for conditional classes

## Naming Conventions

**Files:**

- React components: PascalCase with `.tsx` extension (e.g., `ToolCard.tsx`, `SearchBar.tsx`)
- Utilities/helpers: camelCase with `.ts` extension (e.g., `prisma.ts`, `utils.ts`)
- API routes: lowercase with `route.ts` (e.g., `api/v1/tools/route.ts`)
- Pages: `page.tsx` (Next.js convention)
- Layouts: `layout.tsx` (Next.js convention)

**Directories:**

- Component directories: Grouped by feature/domain (`tools/`, `search/`, `engagement/`, `ui/`)
- Query directory: `queries/` with one file per entity type
- API routes: Grouped under `api/v1/` by resource

**Functions:**

- Query functions: `get{EntityType}()` or `get{EntityType}By{Property}()` (e.g., `getTools()`, `getToolBySlug()`)
- Utility functions: camelCase (e.g., `formatNumber()`, `getCategoryIcon()`)
- React components: PascalCase (e.g., `ToolCard`, `SearchBar`)
- Handler functions: lowercase (e.g., `handleSubmit()`, `handleChange()`)

**Types:**

- Interfaces: PascalCase (e.g., `Tool`, `Category`, `SearchFilters`, `ToolCardProps`)
- Enums: PascalCase (e.g., `ToolType`, `RiskLevel`, `ValidationStatus`)
- Type aliases: PascalCase (e.g., `PaginatedResponse<T>`)

**Variables:**

- Constants: UPPER_SNAKE_CASE for config constants
- Variables: camelCase
- React hooks: `use{HookName}` (e.g., `useState`, `useRouter`)

## Where to Add New Code

**New Feature (e.g., tool recommendations):**

- Primary code: `web/src/lib/queries/recommendations.ts` (query logic)
- API endpoint: `web/src/app/api/v1/recommendations/route.ts`
- Component: `web/src/components/recommendations/RecommendationCard.tsx`
- Types: Add to `web/src/types/index.ts`
- Tests: Create `web/src/lib/queries/recommendations.test.ts`

**New Page (e.g., /trending):**

- Page file: `web/src/app/trending/page.tsx`
- Query function: Add to `web/src/lib/queries/tools.ts` or create `web/src/lib/queries/trending.ts`
- Component: Create `web/src/components/trending/TrendingSection.tsx`
- Route: Automatically available via Next.js file routing

**New Component/Module:**

- Implementation: `web/src/components/{feature}/{ComponentName}.tsx`
- Props interface: Define in same file or export from `web/src/types/index.ts`
- Styles: Use Tailwind classes (no separate CSS files)
- Example: `web/src/components/tools/FilterPanel.tsx`

**Utilities/Helpers:**

- Shared helpers: `web/src/lib/utils.ts`
- Query helpers: `web/src/lib/queries/{entity}.ts`
- Formatting: Add to `utils.ts` (formatNumber, formatDate patterns)

**API Endpoints:**

- Pattern: `web/src/app/api/v1/{resource}/route.ts`
- POST endpoints: `web/src/app/api/v1/{resource}/route.ts` with POST handler
- GET with ID: `web/src/app/api/v1/{resource}/[id]/route.ts`
- Existing pattern: `/api/v1/tools`, `/api/v1/tools/[slug]`, `/api/v1/submit`, `/api/v1/ratings`

## Special Directories

**web/.next/:**
- Purpose: Next.js build output
- Generated: Yes (created by `next build`)
- Committed: No (.gitignored)

**web/node_modules/:**
- Purpose: Installed dependencies
- Generated: Yes (created by `npm install`)
- Committed: No (.gitignored)

**web/prisma/migrations/:**
- Purpose: Database migration history
- Generated: Yes (created by `prisma migrate`)
- Committed: Yes (track schema evolution)

**docker/n8n_data/ (volume):**
- Purpose: n8n workflow persistence
- Generated: Yes (created by n8n container)
- Committed: No (data volume)

**database/:**
- Purpose: SQL initialization scripts
- Generated: No (manual)
- Committed: Yes
- Usage: Loaded by docker-compose during postgres startup

## Import Path Aliases

**Configured in tsconfig.json:**
- `@/*` → `./src/*`

**Usage examples:**
```typescript
import { Tool } from '@/types'
import { getTools } from '@/lib/queries/tools'
import { ToolCard } from '@/components/tools/ToolCard'
import { Button } from '@/components/ui/Button'
```

**Benefits:** Consistent, readable imports regardless of nesting depth, easier refactoring

---

*Structure analysis: 2026-01-23*
