# Solutions Documentation

This directory contains documented solutions to problems encountered during development and operations of the skill-of-skills project.

## Purpose

Each solution document captures:
- **Problem**: What went wrong
- **Symptoms**: How to recognize the issue
- **Root Cause**: Why it happened
- **Solution**: How to fix it
- **Prevention**: How to avoid it in the future

## Why Document Solutions?

The first time you solve a problem takes research and troubleshooting. Document it, and the next occurrence takes minutes. **Knowledge compounds.**

## Structure

Solutions are organized by category:

```
docs/solutions/
├── devops-patterns/     # Docker, deployment, infrastructure
├── database-issues/     # PostgreSQL, migrations, data integrity
├── workflow-issues/     # n8n workflow problems
└── ui-bugs/            # Frontend and web UI issues
```

## Available Solutions

### DevOps Patterns

- [Docker Environment Variables Not Loading](./devops-patterns/docker-env-vars-not-loading.md) - Containers not picking up env var changes
- [Multi-Repository Synchronization Pattern](./devops-patterns/multi-repo-sync-pattern.md) - Keeping local, GitHub, and production in sync
- [Multi-Component Feature Changes](./devops-patterns/multi-component-feature-changes.md) - Adding/removing features across n8n, DB, UI, docs
- [Deployment Validation Checklist](./devops-patterns/deployment-validation.md) - Complete validation before marking deployment complete

## How to Use These Docs

### When You Encounter an Issue

1. Search by symptom:
   ```bash
   grep -r "500 error" docs/solutions/
   grep -r "missing api key" docs/solutions/
   ```

2. Search by component:
   ```bash
   grep -r "docker" docs/solutions/
   grep -r "n8n" docs/solutions/
   ```

3. Browse by category (see directories above)

### When You Solve a New Problem

1. Document it while context is fresh
2. Use the template below
3. Add to appropriate category
4. Update this README

## Solution Template

```markdown
---
title: Problem Title
category: category-name
tags: [tag1, tag2, tag3]
symptoms: [symptom1, symptom2]
date: YYYY-MM-DD
---

# Problem Title

## Problem

[Brief description of what went wrong]

## Symptoms

- Symptom 1
- Symptom 2
- Symptom 3

## Root Cause

[Technical explanation of why this happened]

## Solution

[Step-by-step fix with code examples]

## Prevention

[How to avoid this in the future]

## Related Issues

[Links to related solutions or documentation]

## Tags

`tag1` `tag2` `tag3`
```

## Frontmatter Fields

Each solution includes YAML frontmatter for searchability:

- **title**: Human-readable problem description
- **category**: Directory/category name
- **tags**: Searchable keywords (docker, n8n, database, etc.)
- **symptoms**: Observable issues (error messages, behaviors)
- **date**: When solution was documented

## Searching Solutions

### By Tag
```bash
grep -l "tags:.*docker" docs/solutions/**/*.md
```

### By Symptom
```bash
grep -l "symptoms:.*500 error" docs/solutions/**/*.md
```

### By Category
```bash
ls docs/solutions/devops-patterns/
```

## Contributing

When adding new solutions:

1. Use the template above
2. Include complete frontmatter
3. Provide code examples
4. Link to related solutions
5. Update this README with new solution
6. Use clear, descriptive filenames (kebab-case)

## Related Documentation

- [Pipeline Documentation](../PIPELINE.md)
- [Project README](../../README.md)

---

**Remember**: The goal is to turn every solved problem into institutional knowledge. Each solution compounds your team's capabilities.
