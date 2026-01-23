# 🧠 Skill of Skills

> The Autonomous Discovery Engine for the Claude Code Ecosystem

Automatically discovers, validates, scores, and curates tools from GitHub, X/Twitter, and Reddit for the Claude Code ecosystem.

## Features

- **Multi-source Discovery**: GitHub code search, X/Twitter posts & replies, Reddit mentions
- **AI-powered Entity Extraction**: Uses Claude to identify tool mentions in social posts
- **Automated Validation**: Sandbox testing via GitHub Actions
- **Smart Scoring**: Composite scores based on GitHub stars, social signals, recency, and influencer trust
- **Risk Assessment**: Automatic risk level classification
- **Discord Notifications**: Real-time alerts for new tools and weekly digests
- **Auto-generated README**: Daily updates with categorized tool listings

## Tool Types

| Icon | Type | Install Method |
|------|------|----------------|
| 📄 | Skill | `npx add-skill owner/repo` |
| 🔌 | Plugin | `/plugin install name@directory` |
| 📦 | Collection | `npx add-skill owner/repo` |
| ⌨️ | CLI Tool | `npm install -g package` |
| 🔗 | MCP Server | Configure in MCP settings |
| 📝 | Prompt Pack | Copy/reference |
| 🔄 | Workflow | Import workflow |
| 🧩 | Extension | Install from store |
| 📚 | Resource | Read/reference |

## Risk Levels

| Icon | Level | Description |
|------|-------|-------------|
| 🟢 | Low | Standard permissions |
| 🟡 | Medium | Extended permissions (shell access, subagents) |
| 🔴 | High | Broad system access |
| ⚫ | Critical | Manual review required |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/911fund/skill-of-skills.git
   cd skill-of-skills
   ```

2. **Configure environment**
   ```bash
   cp docker/.env.example docker/.env
   # Edit docker/.env with your API keys
   ```

3. **Start services**
   ```bash
   ./scripts/setup.sh
   ```

4. **Import workflows into n8n**
   - Open http://localhost:5678
   - Import each workflow from `n8n-workflows/`
   - Configure credentials
   - Activate workflows

## Required API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| GitHub | Repository discovery & validation | [GitHub Settings](https://github.com/settings/tokens) |
| X/Twitter | Social mention tracking | [Twitter Developer](https://developer.twitter.com) |
| Anthropic | AI entity extraction | [Anthropic Console](https://console.anthropic.com) |
| Discord | Notifications | [Discord Webhooks](https://discord.com/developers/docs/resources/webhook) |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  GitHub Search  │     │   X/Twitter     │     │     Reddit      │
│   (6 hours)     │     │   (daily)       │     │   (12 hours)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Discovery Queue      │
                    │     (PostgreSQL)        │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │      Validator          │
                    │     (2 hours)           │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │    Score Calculator     │
                    │     (4 hours)           │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌────────▼────────┐   ┌──────────▼─────────┐   ┌────────▼────────┐
│ Discord Notify  │   │  README Generator  │   │  Unknown Alert  │
└─────────────────┘   └────────────────────┘   └─────────────────┘
```

## Workflows

| # | Workflow | Schedule | Purpose |
|---|----------|----------|---------|
| 01 | GitHub Collector | Every 6h | Search GitHub for skills, plugins, MCP servers |
| 02 | X Collector | Daily | Collect tweets and replies mentioning Claude Code |
| 03 | Entity Extractor | Webhook | AI extraction of tool names from posts |
| 04 | Reddit Collector | Every 12h | Monitor subreddits for tool mentions |
| 05 | Validator | Every 2h | Validate queued repos, classify tool type |
| 06 | Scorer | Every 4h | Calculate composite scores |
| 07 | README Generator | Webhook | Generate updated README |
| 08 | Discord Notifier | Webhook | Alert on new tools |
| 09 | Weekly Digest | Mondays 9 AM | Weekly summary to Discord |
| 10 | Unknown Alert | Webhook | Alert on unrecognized tool mentions |

## Scripts

```bash
./scripts/setup.sh      # Initial setup
./scripts/backup-db.sh  # Backup PostgreSQL
./scripts/manual-add.sh # Manually add a repo to queue
```

## Database

PostgreSQL schema includes:
- `tools` - Main tool registry
- `categories` - Tool categories
- `influencers` - Trusted accounts
- `social_mentions` - X/Reddit posts
- `unknown_mentions` - Unresolved tool references
- `discovery_queue` - Pending validation
- `metrics_history` - Score tracking

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for submission guidelines.

## Security

See [SECURITY.md](SECURITY.md) for risk assessment methodology.

## License

MIT License - see [LICENSE](LICENSE)

---

*🧠 Auto-generated by Skill of Skills*
