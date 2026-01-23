# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**GitHub:**
- Service: GitHub API v3 / GraphQL Search API
  - What it's used for: Code discovery, repository metadata (stars, forks, last commit)
  - SDK/Client: n8n HTTP Request node
  - Auth: `GITHUB_TOKEN` (Personal Access Token)
  - Workflow: `n8n-workflows/01-github-collector.json`
  - Rate limiting: Batch size 1, 2.5s interval between requests

**X (Twitter):**
- Service: X API v2
  - What it's used for: Social mention collection, sentiment analysis, tool recommendations
  - SDK/Client: n8n HTTP Request node
  - Auth: `X_BEARER_TOKEN` (OAuth Bearer Token)
  - Workflow: `n8n-workflows/02-x-collector.json`
  - Endpoint: `https://api.twitter.com/2/tweets/search/recent`
  - Query fields: created_at, public_metrics, author_id, in_reply_to_user_id
  - Rate limiting: Batch size 1, 1.5s interval between requests

**Anthropic Claude:**
- Service: Claude API (via n8n integration)
  - What it's used for: Tool validation, risk assessment, entity extraction
  - SDK/Client: n8n HTTP Request node
  - Auth: `ANTHROPIC_API_KEY` (API Key)
  - Workflows: Entity extraction workflows

**Discord:**
- Service: Discord Webhooks API
  - What it's used for: Notifications for new tools, weekly summaries, alerts
  - SDK/Client: n8n HTTP Request node
  - Auth: `DISCORD_WEBHOOK_URL` (Webhook URL - hardcoded in workflows)
  - Webhook ID: `1463969592626909388`
  - Workflows:
    - `n8n-workflows/08-discord-notifier.json` - New tool notifications with embeds
    - `n8n-workflows/09-discord-weekly.json` - Weekly trend summary
    - `n8n-workflows/10-unknown-tool-alert.json` - Unknown mention alerts

## Data Storage

**Databases:**

PostgreSQL 16 (containerized):
  - Connection: `POSTGRES_USER=your_db_user`, `POSTGRES_PASSWORD=*`, `POSTGRES_DB=skill_of_skills`
  - Port: 5432 (local) → 5432 (container)
  - Client: Prisma ORM via `@prisma/client`
  - Extensions: `uuid-ossp` (UUID generation), `pg_trgm` (full-text search)
  - Schema location: `database/schema.sql`
  - Initialization:
    - `database/schema.sql` - Main schema creation
    - `database/seed.sql` - Initial data seeding
  - Health check: Built-in PostgreSQL readiness probe

**File Storage:**
- Local filesystem only
- Public assets: `web/public/` directory
- Static generated files: `.next/static/`
- Prisma schema: `web/prisma/schema.prisma`

**Caching:**
- None detected - full database queries for each request
- Prisma client singleton in `web/src/lib/prisma.ts` with development hot-reload handling

## Authentication & Identity

**Auth Provider:**
- Custom session tracking (session-based)
  - Implementation: `sessionId` field on user engagement tables (Rating, Comment, Favorite)
  - Session storage: Client-side or temporary (no auth system)
  - User identification: Opaque session IDs only

**No centralized auth:**
- No OAuth providers configured
- No user registration system
- Anonymous engagement tracking via session IDs

## Monitoring & Observability

**Error Tracking:**
- None detected - manual error responses in API routes
- Error handling: Basic try/catch with 500 status responses

**Logs:**
- Docker container logs: `docker-compose logs -f`
- n8n logs: Visible via Docker Compose
- Application logs: Console output to stdout (Next.js)
- n8n workflow execution logs: Available in n8n UI

**Error Responses:**
- API error responses return JSON: `{error: "message"}` with HTTP status codes
- No structured logging framework

## CI/CD & Deployment

**Hosting:**
- Docker Compose (local/self-hosted)
- Services: Web (Next.js), n8n (workflow engine), PostgreSQL
- Network: `skill-network` bridge network

**CI Pipeline:**
- None detected
- Manual deployment via Docker Compose

**GitHub Integration:**
- Repository: `911fund/skill-of-skills`
- Token scope: Full repository access for README updates
- Push mechanism: n8n workflow with HTTP Request node (currently not functional per CLAUDE.md)
- Alternative script: `/tmp/generate-readme.js` for README generation and push

## Environment Configuration

**Required env vars (docker/.env):**
- `POSTGRES_USER=your_db_user`
- `POSTGRES_PASSWORD=*` (must be set)
- `POSTGRES_DB=skill_of_skills`
- `N8N_USER=admin`
- `N8N_PASSWORD=*` (must be set)
- `N8N_HOST=localhost`
- `N8N_PORT=5678`
- `N8N_PROTOCOL=http`
- `GITHUB_TOKEN=ghp_*` (GitHub Personal Access Token)
- `X_BEARER_TOKEN=*` (X API v2 Bearer Token)
- `ANTHROPIC_API_KEY=sk-ant-*` (Claude API key)
- `DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/*`
- `GH_ACTIONS_PAT=ghp_*` (GitHub Actions Personal Access Token)
- `WEB_PORT=3001` (Host port mapping)
- `APP_URL=http://localhost:3001`

**Web-specific env vars (web/.env.local):**
- `DATABASE_URL=postgresql://...` (Generated from docker-compose)
- `NEXT_PUBLIC_APP_URL=http://localhost:3001` (Client-side)

**Secrets location:**
- Docker environment file: `docker/.env` (git-ignored)
- n8n credentials: Stored in n8n database (`postgres` service)
- GitHub token: Embedded in n8n HTTP nodes (not best practice)

## Webhooks & Callbacks

**Incoming Webhooks:**
- n8n webhook endpoint: `/webhook/notify-new-tool`
  - Defined in: `n8n-workflows/08-discord-notifier.json`
  - Method: POST
  - Payload: Tool discovery data for Discord notification

**Outgoing Webhooks:**
- Discord webhook: `https://discord.com/api/webhooks/1463969592626909388/...`
  - Triggered by: New tool discovery, weekly summaries, alerts
  - Payload format: Discord embed JSON with tool metadata

**GitHub Integration:**
- Endpoint: `https://api.github.com/repos/911fund/skill-of-skills/contents/README.md`
- Method: PUT
- Purpose: README.md auto-update with discovered tools
- Authentication: `GITHUB_TOKEN` header

## External Service Dependencies

**Data Sources (Read-only):**
- GitHub Search API: Query for tool repositories
- X (Twitter) API: Query for social mentions
- PostgreSQL: Primary data store

**Data Sinks (Write):**
- PostgreSQL: Store discovered tools, metrics, social mentions
- Discord: Outbound notifications
- GitHub: README.md updates

**Scheduled Workflows:**
- 01-github-collector: Every 6 hours
- 02-x-collector: Every 1 day (24 hours)
- 04-reddit-collector: Every 4 hours (implied from n8n-workflows list)
- 05-validator: Every 2 hours
- 06-scorer: Every 4 hours
- 07-readme-generator: On demand or scheduled
- 08-discord-notifier: Webhook-triggered
- 09-discord-weekly: Weekly schedule
- 10-unknown-tool-alert: Triggered by unknown mentions

---

*Integration audit: 2026-01-23*
