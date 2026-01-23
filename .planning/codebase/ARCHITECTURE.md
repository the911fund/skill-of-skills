# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Multi-tier discovery and indexing system using event-driven workflow automation (n8n) feeding a Next.js web application via PostgreSQL.

**Key Characteristics:**
- Event-driven data pipeline with staggered scheduled workflows
- Server-side rendering with static query layer
- API routes for user engagement (ratings, comments, favorites)
- Prisma ORM for all database access with type-safe queries
- Session-based user interaction tracking (no authentication)

## Layers

**Presentation Layer:**
- Purpose: Server-rendered React pages and API responses
- Location: `web/src/app/`
- Contains: Next.js App Router pages, API routes, layout components
- Depends on: Query layer, Prisma client, component library
- Used by: Users via HTTP/browser

**Component/UI Layer:**
- Purpose: Reusable React components for rendering
- Location: `web/src/components/`
- Contains: UI primitives (Button, Card, Badge), domain components (ToolCard, ToolDetail, SearchBar)
- Depends on: Types, utils, Tailwind CSS
- Used by: All pages and other components

**Query/Data Access Layer:**
- Purpose: Encapsulate all database queries
- Location: `web/src/lib/queries/`
- Contains: `tools.ts`, `categories.ts`, `search.ts`, `stats.ts`
- Pattern: Async functions that return typed responses
- Depends on: Prisma client, type definitions
- Used by: Pages and API routes

**ORM/Database Layer:**
- Purpose: Database abstraction and client
- Location: `web/src/lib/prisma.ts` and `web/prisma/schema.prisma`
- Contains: Prisma client singleton, schema definitions
- Depends on: PostgreSQL
- Used by: Query layer

**Workflow Automation Layer (n8n):**
- Purpose: Scheduled discovery, validation, and scoring
- Location: `n8n-workflows/`
- Contains: JSON workflow definitions (collectors, validators, scorers)
- Pattern: Staggered cron-based triggers → batch processing → database updates
- Depends on: PostgreSQL, external APIs (GitHub, X, Reddit)

**Infrastructure Layer:**
- Purpose: Container orchestration and service configuration
- Location: `docker/`
- Contains: docker-compose.yml, Dockerfile.web, environment files
- Services: Next.js web app, n8n, PostgreSQL

## Data Flow

**Discovery Pipeline:**

1. **GitHub Collector (every 6h)**
   - Queries GitHub API for Claude-related repositories
   - Inserts discovered repos into `discovery_queue` table
   - Source: `n8n-workflows/01-github-collector.json`

2. **Tool Validator (every 2h)**
   - Reads `discovery_queue` where status = 'pending'
   - Fetches repo, parses metadata (skill.md, claude.plugin, mcp.json)
   - Determines risk level and validation status
   - Inserts validated tools into `tools` table
   - Updates `discovery_queue` status to 'processed'
   - Source: `n8n-workflows/05-validator.json`

3. **Score Calculator (every 4h)**
   - Reads all tools from `tools` table
   - Calculates composite score from: GitHub metrics, social mentions, recency, influencer score
   - Updates `tools.compositeScore`, `tools.trendingScore`
   - Records historical data in `metrics_history`
   - Source: `n8n-workflows/06-scorer.json`

4. **Web App Query**
   - User visits `/tools`
   - Page component calls `getTools()` from `web/src/lib/queries/tools.ts`
   - Prisma executes query with filters, sorting, pagination
   - Renders ToolCard components from results

**User Engagement Flow:**

1. User rates tool: POST `/api/v1/ratings` → creates `Rating` record
2. User comments: POST `/api/v1/comments` → creates `Comment` record (status: pending)
3. User favorites: POST `/api/v1/favorites` → creates `Favorite` record
4. User submits tool: POST `/api/v1/submit` → creates `DiscoveryQueue` record (source: manual_submission)

**State Management:**

- **Persistent State:** PostgreSQL database with Prisma schema
- **Session State:** Session IDs passed via query params (clientside) or cookies for user tracking
- **Computed State:** Scores calculated from base metrics during validation/scoring phase
- **Cache:** No caching layer (force-dynamic on pages)

## Key Abstractions

**Tool Discovery Entity:**
- Purpose: Represents a Claude Code tool/skill
- Examples: `Tool` model in `prisma/schema.prisma`, `Tool` interface in `web/src/types/index.ts`
- Pattern: Domain-driven design with rich attributes (type, risk level, validation status, scores)

**Query Functions:**
- Purpose: Encapsulate database access logic
- Examples: `getTools()`, `getToolBySlug()`, `getTrendingTools()` in `web/src/lib/queries/tools.ts`
- Pattern: Async functions with typed returns, filtering/sorting logic in WHERE/ORDER BY

**Component Props Pattern:**
- Purpose: Type-safe component contracts
- Examples: `ToolCardProps`, `ToolDetailProps` in `web/src/components/tools/`
- Pattern: Interfaces for each component with extracted typing

**Workflow Jobs:**
- Purpose: Discrete, idempotent tasks
- Examples: GitHub discovery, validation, scoring
- Pattern: n8n workflows with error handling and state management via database status field

## Entry Points

**Web Application:**
- Location: `web/src/app/layout.tsx`
- Triggers: HTTP request from user
- Responsibilities: Root layout, metadata, Header/Footer wrapping

**Home Page:**
- Location: `web/src/app/page.tsx`
- Triggers: GET /
- Responsibilities: Fetch trending, recent, and categories; render hero + sections

**Tools Browse:**
- Location: `web/src/app/tools/page.tsx`
- Triggers: GET /tools?type=&sort=&page=
- Responsibilities: Fetch tools with filters, render grid with pagination

**Tool Detail:**
- Location: `web/src/app/tools/[slug]/page.tsx`
- Triggers: GET /tools/{slug}
- Responsibilities: Fetch single tool, render detailed view with engagement

**API Routes:**
- Location: `web/src/app/api/v1/`
- Triggers: HTTP requests to `/api/v1/*`
- Routes: `/tools`, `/tools/[slug]`, `/categories`, `/submit`, `/ratings`, `/comments`, `/favorites`, `/search`, `/stats`

**n8n Workflows:**
- Location: `docker/n8n-workflows/`
- Triggers: Cron schedules from env config
- Workflows:
  - `01-github-collector.json` - discover repos
  - `05-validator.json` - validate discovered tools
  - `06-scorer.json` - calculate scores
  - `07-readme-generator.json` - generate catalog (use script instead)

## Error Handling

**Strategy:** Graceful degradation with logging and HTTP error codes

**Patterns:**

- **Query Layer:** Try-catch in API routes, 500 status for DB errors
  ```typescript
  try {
    const result = await getTools(filters, page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 })
  }
  ```

- **Page Layer:** Use Next.js `notFound()` for 404s
  ```typescript
  const tool = await getToolBySlug(params.slug)
  if (!tool) {
    notFound()
  }
  ```

- **Validation:** Check for duplicates before insert (DiscoveryQueue, Ratings by sessionId+toolId)
  ```typescript
  const existing = await prisma.discoveryQueue.findFirst({ where: { repoUrl } })
  if (existing) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }
  ```

- **n8n Workflows:** Status field tracking (pending → processing → processed)

## Cross-Cutting Concerns

**Logging:** Not detected. Consider adding: structured logging for API errors, workflow execution status

**Validation:** Type checking via TypeScript and Prisma schema validation. No runtime validation middleware.

**Authentication:** Not implemented. Session tracking via sessionId parameter passed to engagement endpoints.

**Authorization:** Not implemented. All endpoints are public.

**Rate Limiting:** Not implemented.

---

*Architecture analysis: 2026-01-23*
