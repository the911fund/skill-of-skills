# n8n workflow exports

The production discovery pipeline currently appears to run outside this repository. Future changes should export/import the n8n workflows here so the public repo contains the reviewable source of truth.

Expected exports:

- `skill-discovery.workflow.json`: scheduled/source-registry ingestion and GitHub search.
- `official-sync.workflow.json`: high-trust source sync from `sources.yml`.
- `readme-regenerate.workflow.json`: README generation backing `/api/v1/readme/regenerate`.
- `route-skill.workflow.json`: task-to-best-skill routing for `/api/v1/route`.

Do not commit secrets, credentials, webhook URLs, or environment-specific IDs. Use n8n credential references and document required environment variables separately.
