# Changelog

All notable changes to Skill of Skills will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release
- Automated discovery from GitHub, X/Twitter, and Reddit
- n8n workflow-based validation pipeline
- Risk assessment and scoring system
- Auto-generated README with tool index
- Discord notifications for new discoveries
- GitHub Actions for plugin sync and README updates

### Discovery Sources
- GitHub code search (SKILL.md, plugin.json, mcp.json)
- X/Twitter keyword monitoring
- Reddit r/ClaudeAI monitoring

### Tool Types Supported
- Skills (SKILL.md)
- Plugins (.claude-plugin)
- Collections (multi-skill repos)
- CLI Tools
- MCP Servers
- Prompt Packs
- Workflows
- Extensions
- Resources

---

## Versioning Note

This project uses continuous deployment. The README auto-updates daily with the latest discovered tools. For stable snapshots, see [GitHub Releases](https://github.com/the911fund/skill-of-skills/releases).
