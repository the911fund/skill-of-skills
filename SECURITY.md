# Security Policy

## Risk Assessment Methodology

Skill of Skills automatically assesses the risk level of discovered tools based on multiple factors.

### Risk Levels

| Level | Icon | Score Multiplier | Description |
|-------|------|------------------|-------------|
| **Low** | 🟢 | 1.0 | Standard permissions, safe for general use |
| **Medium** | 🟡 | 0.85 | Extended permissions, review recommended |
| **High** | 🔴 | 0.6 | Broad system access, careful evaluation needed |
| **Critical** | ⚫ | 0.1 | Requires manual review before use |

### Risk Factors

Tools are flagged for elevated risk if they contain:

**Medium Risk Indicators**
- Shell command execution (`exec`, `spawn`, `child_process`)
- Subprocess spawning
- Subagent capabilities
- File system modifications
- Network requests to external services

**High Risk Indicators**
- `sudo` or root access
- Broad file system access (`rm -rf`, `chmod 777`)
- Credential handling
- System configuration changes
- Dynamic code evaluation (`eval`)

**Critical Risk Indicators**
- Multiple high-risk factors combined
- Known malicious patterns
- Missing license or attribution
- Heavily obfuscated code

### Validation Process

1. **Automatic Scanning**: Code is scanned for risk patterns
2. **Sandbox Testing**: Installation is tested in isolated GitHub Actions runner
3. **Community Signals**: High engagement from trusted influencers increases confidence
4. **Manual Review**: Critical-risk tools require human review

## Recommendations

### Before Installing Any Tool

1. **Check the Risk Level**: Look for the risk indicator
2. **Review the Source**: Visit the GitHub repository
3. **Read the Code**: Especially for medium+ risk tools
4. **Check Stars & Activity**: More stars and recent commits suggest active maintenance
5. **Review Permissions**: Understand what access the tool requests

### For Medium Risk Tools

- Review the README and documentation
- Check what shell commands are executed
- Verify the author's reputation
- Consider sandboxed testing first

### For High/Critical Risk Tools

- Full code review recommended
- Test in isolated environment
- Verify with multiple sources
- Contact maintainer if unclear

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

Skill of Skills provides risk assessments as guidance only. We do not guarantee the safety of any indexed tool. Always:

- Review code before running
- Use sandboxed environments for testing
- Follow your organization's security policies
- Take responsibility for tools you install

## Updates

This security policy is reviewed and updated regularly. Check back for the latest guidance.

---

*Security is a shared responsibility. Use tools wisely.* 🔒
