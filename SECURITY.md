# Security Policy

## Risk Assessment Methodology

Skill of Skills uses AI-powered risk classification to assess discovered tools. Each tool entering the pipeline is analyzed by Claude Haiku, which examines the repository's code patterns, permissions, and capabilities.

### Risk Levels

| Level | Description |
|-------|-------------|
| **Low** | Standard permissions, safe for general use |
| **Medium** | Extended permissions (shell access, file writes), review recommended |
| **High** | Broad system access, credential handling, or dynamic code evaluation |

### What the AI Evaluates

The risk assessment examines:

- **SKILL.md / plugin manifest**: Declared permissions and capabilities
- **File markers**: Presence of `mcp.json`, `claude-plugin.json`, `SKILL.md`
- **Repository metadata**: License, description, organization
- **Dependency vulnerabilities**: GitHub SBOM API for known CVEs

### Signals That Elevate Risk

**Medium Risk Indicators**
- Shell command execution (`exec`, `spawn`, `child_process`)
- Subprocess or subagent spawning
- File system write operations
- Network requests to external services

**High Risk Indicators**
- `sudo` or root access patterns
- Broad file system access (`rm -rf`, `chmod 777`)
- Credential handling or storage
- System configuration changes
- Dynamic code evaluation (`eval`)
- Multiple medium-risk indicators combined

### Validation Gates

Tools pass through validation before being indexed:

1. **Claude Relevance Check**: Must be related to Claude Code, MCP, or Anthropic tooling
2. **Star Threshold**: Minimum star count for community validation
3. **AI Risk Classification**: Automated risk level assignment with reasoning
4. **Dependency Scan**: GitHub SBOM checked for known vulnerabilities
5. **3-Strike Deactivation**: Tools returning API errors on 3 consecutive daily refreshes are automatically deactivated

## Maintenance Status

Tool health is continuously monitored via daily metadata refresh:

| Status | Criteria |
|--------|----------|
| **Active** | Committed within last 90 days |
| **Stable** | >90 days since commit but has tagged releases (feature-complete) |
| **Stale** | 90-365 days without commits and no releases |
| **Unmaintained** | >365 days without commits |

## Recommendations

### Before Installing Any Tool

1. **Check the Risk Level**: Displayed on each tool's detail page
2. **Review the Source**: Visit the GitHub repository
3. **Check Maintenance Status**: Active and Stable tools are healthier choices
4. **Review Permissions**: Understand what access the tool requests
5. **Check Dependencies**: Vulnerability count is shown when available

### For Medium Risk Tools

- Review the README and documentation
- Check what shell commands are executed
- Verify the author's reputation

### For High Risk Tools

- Full code review recommended
- Test in isolated environment
- Verify with multiple sources

## Reporting Security Issues

### In Skill of Skills

If you find a security issue in this project:

1. **Do not** open a public issue
2. Email security concerns to the maintainers
3. Include detailed reproduction steps
4. Allow time for a fix before disclosure

### In Discovered Tools

If you find a security issue in a tool we've indexed:

1. Report to the tool maintainer first
2. Open an issue here to flag the tool for review
3. We'll update the risk assessment accordingly

## Disclaimer

Skill of Skills provides risk assessments as guidance only. AI classification is not a substitute for manual code review. Always:

- Review code before running
- Use sandboxed environments for testing
- Follow your organization's security policies

---

*Security is a shared responsibility. Use tools wisely.*
