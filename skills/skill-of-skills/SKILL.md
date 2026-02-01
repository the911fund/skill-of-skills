---
name: skill-of-skills
description: Discover and install trending Claude Code tools from the entire ecosystem.
version: 2.0.0
author: 911fund
repository: https://github.com/the911fund/skill-of-skills
---

# Skill of Skills

The autonomous discovery engine for Claude Code tools. Searches GitHub, X/Twitter, and Reddit to find, validate, and score the best skills, plugins, MCP servers, and more.

## Commands

Ask me to:

- **"Search for skills about [topic]"** - Find tools related to a specific topic
- **"What tools are trending?"** - Show the hottest new discoveries
- **"Show me MCP servers"** - List all MCP server integrations
- **"Show me marketing skills"** - Filter by category
- **"Is [tool] safe to install?"** - Check risk assessment for a tool
- **"What's new this week?"** - Weekly digest of discoveries
- **"Find plugins for [task]"** - Search by use case

## Tool Types

| Type | Description |
|------|-------------|
| 📄 Skill | Single-purpose Claude Code skill |
| 🔌 Plugin | Claude plugin with extended capabilities |
| 📦 Collection | Bundle of multiple skills |
| ⌨️ CLI Tool | Command-line utility |
| 🔗 MCP Server | Model Context Protocol integration |
| 📝 Prompt Pack | Curated prompt collections |
| 🔄 Workflow | Automation workflow template |
| 🧩 Extension | IDE/browser extension |
| 📚 Resource | Documentation/tutorial |

## Risk Levels

| Level | Meaning |
|-------|---------|
| 🟢 Low | Safe, standard permissions |
| 🟡 Medium | Uses shell commands or subagents |
| 🔴 High | Broad system access |
| ⚫ Critical | Requires manual review |

## Installation

Most skills can be installed with:

```bash
npx add-skill owner/repo
```

## Learn More

Visit the [Skill of Skills repository](https://github.com/the911fund/skill-of-skills) for:
- Full tool listings
- API documentation
- Contributing guidelines
