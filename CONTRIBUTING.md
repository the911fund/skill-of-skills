# Contributing to Skill of Skills

Thank you for your interest in contributing! This document outlines how to submit new tools and contribute to the project.

## Submitting a New Tool

### Automatic Discovery

Most tools are discovered automatically through:
- GitHub code search (SKILL.md, plugin.json, mcp.json)
- X/Twitter mentions
- Reddit discussions

### Manual Submission

To manually submit a tool:

1. **Via Script**
   ```bash
   ./scripts/manual-add.sh https://github.com/owner/repo
   ```

2. **Via Database**
   ```sql
   INSERT INTO discovery_queue (repo_url, source, status)
   VALUES ('https://github.com/owner/repo', 'manual_submission', 'pending');
   ```

3. **Via Pull Request**
   - Add the tool to the seed data in `database/seed.sql`
   - Submit a PR with description of the tool

### Tool Requirements

For a tool to be accepted:

- [ ] Must be related to Claude Code ecosystem
- [ ] Must have a valid GitHub repository
- [ ] Should have at least one of:
  - `SKILL.md` file
  - `.claude-plugin` directory
  - `mcp.json` file
  - Clear documentation

### Tool Types

Specify the correct type when submitting:

| Type | Requirements |
|------|--------------|
| `skill` | Contains SKILL.md |
| `plugin` | Has .claude-plugin directory with plugin.json |
| `collection` | Multiple skills in one repo |
| `cli_tool` | Has package.json with bin field |
| `mcp_server` | Has mcp.json configuration |
| `prompt_pack` | Collection of prompts |
| `workflow` | n8n/automation workflow |
| `extension` | Browser/IDE extension |
| `resource` | Documentation/tutorial |

## Code Contributions

### Setup Development Environment

1. Fork the repository
2. Clone your fork
3. Run `./scripts/setup.sh`
4. Make your changes
5. Test locally
6. Submit a PR

### Areas for Contribution

- **New Collectors**: Add support for new discovery sources
- **Improved Scoring**: Enhance the scoring algorithm
- **Better Validation**: Add more validation checks
- **UI/Dashboard**: Build a web interface
- **Documentation**: Improve docs and examples

### Code Style

- Use meaningful variable names
- Add comments for complex logic
- Test workflows before submitting
- Update documentation as needed

## Reporting Issues

### Bug Reports

Include:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Environment details (OS, Docker version)
- Relevant logs

### Feature Requests

Include:
- Use case description
- Proposed solution
- Alternatives considered

## Questions?

Open a GitHub issue with the `question` label.

---

Thank you for contributing to Skill of Skills! 🧠
