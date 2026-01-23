# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.4.0 - Frontend and backend code in Next.js application
- JavaScript (Node.js) - n8n workflow expressions and scripts
- SQL - PostgreSQL schema and query definitions

**Secondary:**
- HTML/CSS - React JSX templates
- YAML - Docker Compose configuration

## Runtime

**Environment:**
- Node.js 20-alpine - Web application container runtime
- Node.js (n8n) - n8n workflow engine runtime

**Package Manager:**
- npm 9/10 (bundled with Node 20)
- Lockfile: `web/package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 14.2.0 - Full-stack React framework for web application
  - Features: App Router, API routes, Server Components, Standalone output
- React 18.3.0 - UI library for component rendering
- React DOM 18.3.0 - DOM bindings for React

**Database ORM:**
- Prisma 5.14.0 - Database schema management and client
  - Client: `@prisma/client` 5.14.0
  - Schema location: `web/prisma/schema.prisma`
  - Features: Full-text search (preview), automatic migrations

**Styling:**
- Tailwind CSS 3.4.3 - Utility-first CSS framework
- PostCSS 8.4.38 - CSS processing
- Autoprefixer 10.4.19 - Vendor prefix automation

**Testing & Quality:**
- ESLint 8.57.0 - JavaScript/TypeScript linting
  - Config: `eslint-config-next` 14.2.0 (Next.js integration)
- TypeScript 5.4.0 - Type checking

**Build & Deployment:**
- Docker - Container orchestration
  - Base image: `node:20-alpine` with OpenSSL
  - Multi-stage build: deps → builder → runner
- Docker Compose 3.8 - Service orchestration

**Workflow Automation:**
- n8n (latest) - Node-based workflow automation platform
  - Deployed as: `n8nio/n8n:latest`

## Key Dependencies

**Critical:**
- `@prisma/client` 5.14.0 - Database access and type generation
  - Generates TypeScript types from schema
  - Full-text search capability via PostgreSQL extension
- `next` 14.2.0 - Core framework providing server and client
- `react` 18.3.0 - UI rendering library
- `tailwindcss` 3.4.3 - CSS framework for styling

**Utilities:**
- `clsx` 2.1.0 - Conditional CSS class composition
- `date-fns` 3.6.0 - Date formatting and manipulation

**Type Definitions:**
- `@types/node` 20.12.0
- `@types/react` 18.3.0
- `@types/react-dom` 18.3.0

## Configuration

**Environment:**
- `.env.local` - Development environment variables (per web/.env.local.example)
  - `DATABASE_URL` - PostgreSQL connection string
  - `NEXT_PUBLIC_APP_URL` - Client-side application URL
- `docker/.env` - Docker Compose environment file (per docker/.env.example)
  - PostgreSQL credentials: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
  - n8n credentials: `N8N_USER`, `N8N_PASSWORD`, `N8N_HOST`, `N8N_PORT`
  - API keys: `GITHUB_TOKEN`, `X_BEARER_TOKEN`, `ANTHROPIC_API_KEY`, `DISCORD_WEBHOOK_URL`
  - Web config: `WEB_PORT`, `APP_URL`

**TypeScript:**
- `web/tsconfig.json` - TypeScript compiler options
  - Path alias: `@/*` → `./src/*`
  - Strict mode enabled
  - JSX: preserve (processed by Next.js)

**Next.js:**
- `web/next.config.js` - Next.js build configuration
  - Output: `standalone` (self-contained production build)
  - React Strict Mode: enabled

**Tailwind CSS:**
- `web/tailwind.config.js` - Tailwind configuration (auto-generated)
- `web/postcss.config.js` - PostCSS pipeline configuration

## Platform Requirements

**Development:**
- Node.js 20+ (Alpine Linux compatible)
- Docker and Docker Compose
- PostgreSQL 16 (containerized)
- n8n service (containerized)

**Production:**
- Docker containers on any Docker-compatible host
- PostgreSQL 16+ database server
- Node.js 20-alpine runtime (built into image)

## NPM Scripts

```bash
npm run dev              # Start development server (Next.js dev)
npm run build            # Build production bundle
npm start                # Start production server
npm run lint             # Run ESLint checks
npm run db:generate      # Generate Prisma client from schema
npm run db:push          # Apply schema changes to database
npm run db:studio        # Open Prisma Studio GUI
```

## Architecture Notes

**Prisma Query Engine:**
- Uses library mode: `PRISMA_CLI_QUERY_ENGINE_TYPE=library`
- Bundled with application for containerized deployments
- Full-text search enabled via PostgreSQL `pg_trgm` extension

**Production Build:**
- Standalone output allows running Node server without Docker
- Static assets cached in `.next/static`
- Public assets served from `public/` directory

---

*Stack analysis: 2026-01-23*
