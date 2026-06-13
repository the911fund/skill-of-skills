# Sources and ingestion model

Skill of Skills should behave like a skill selector, not a broad AI-adjacent repository list. The ingestion pipeline therefore starts from a public source registry and emits **skill-level** records wherever possible.

## Source registry

`sources.yml` is the public source-of-truth for high-trust ingestion. It includes:

- official skill/plugin packs, such as `n8n-io/skills` and Anthropic-owned sources
- vendor-owned plugin and skill repositories with concrete skill artifacts, such
  as `Xquik-dev/tweetclaw`
- reference workflows, such as the n8n “use skills in agent node” workflow
- lower-trust discovery queries for ecosystems without official registries

The live backend or n8n workflow should read this registry instead of hard-coding a single GitHub API path inside a GitHub Action.

## Repo is not skill

A repository can contain:

- one skill
- many skills
- a plugin pack
- a workflow template
- a generic library with no usable skill

The crawler should create separate records for discovered skill files and attach them to the parent repo. Repository-level records are useful for popularity and maintenance, but routing should prefer skill-level records.

## Minimum crawler behavior

For each source repo:

1. Fetch repository metadata from GitHub.
2. Traverse declared `paths` from `sources.yml`.
3. Detect candidate files:
   - `SKILL.md`, `skill.md`
   - packaged skill paths declared by official plugin sources
   - `AGENTS.md`
   - `CLAUDE.md`
   - `.cursor/rules/**`
   - `.cursorrules`
   - `.windsurfrules`
   - `.clinerules`
   - `mcp.json`
   - plugin manifests
4. Parse frontmatter and headings.
5. Extract trigger language, examples, references, install/use steps, safety notes, verification steps, and linked scripts/templates.
6. Store evidence fields used by ranking and validation.

## Official n8n priority

`n8n-io/skills` is a first-class source. The pipeline should recognize the official n8n pattern:

```text
available-skills / using-n8n-skills
→ choose capability skill
→ open that skill
→ load references on demand
→ apply pre-action guards before high-impact tool calls
```

The current public API should surface the official n8n meta-skill before community clones when the query involves n8n workflow construction, MCP-backed n8n work, workflow validation, node configuration, credentials, or error handling.

## False-positive controls

Generic repos should be downgraded unless they contain explicit skill signals. High-star libraries such as frameworks, databases, OCR libraries, and language runtimes can be listed as resources, but they should not outrank actual skill files for task routing.
