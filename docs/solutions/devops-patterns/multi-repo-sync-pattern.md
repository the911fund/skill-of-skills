---
title: Multi-Repository Synchronization Pattern
category: devops-patterns
tags: [git, deployment, sync, aws, github]
symptoms: [configuration drift, out-of-sync repos, deployment issues]
date: 2026-02-01
---

# Multi-Repository Synchronization Pattern

## Problem

When working with the same codebase across multiple locations (local development, GitHub, production server), repositories can easily get out of sync, leading to:
- Configuration drift between environments
- Features working locally but failing in production
- Difficult rollbacks and debugging
- Lost changes or merge conflicts

## Context: skill-of-skills Architecture

This project maintains three repository locations:

1. **Local Mac** (`/Users/pw/911fund/911fund_public_repos/skill-of-skills`) - Development
2. **GitHub** (https://github.com/the911fund/skill-of-skills) - Version control
3. **AWS Production** (aws1 server) - Live deployment

## Solution: Ordered Sync Pattern

Always synchronize in this specific order to prevent drift:

**Local → GitHub → Production**

### Step-by-Step Workflow

```bash
# === 1. LOCAL DEVELOPMENT ===
# Make and test changes on local machine
vim some-file.js
npm test
npm run build

# === 2. COMMIT TO VERSION CONTROL ===
# Commit to local git
git add .
git commit -m "Descriptive commit message"

# Push to GitHub (central source of truth)
git push origin main

# === 3. DEPLOY TO PRODUCTION ===
# SSH to production server
ssh aws1

# Navigate to project directory
cd /path/to/skill-of-skills

# Pull latest changes from GitHub
git pull origin main

# Restart services if configuration changed
docker-compose restart

# Or if docker-compose.yml changed:
docker-compose down
docker-compose up -d

# Exit production server
exit
```

## Why This Order Matters

### ✅ Correct Order: Local → GitHub → Production

- **Local first**: Test changes in safe environment
- **GitHub second**: Centralized version control and backup
- **Production last**: Deploy only tested, versioned code

### ❌ Wrong Order: Direct Local → Production

Skipping GitHub leads to:
- No version history
- No code review opportunity
- No backup if production fails
- Team members unaware of changes

### ❌ Wrong Order: Production → GitHub

Making changes directly on production:
- Bypasses testing
- Creates emergency situations
- Hard to rollback safely
- Others deploy old code from GitHub

## Validation Checklist

After completing sync, verify all repos match:

```bash
# On local machine
git log --oneline -1
# Note the commit hash

# On GitHub
# Visit https://github.com/the911fund/skill-of-skills
# Verify latest commit matches local

# On production
ssh aws1
cd /path/to/skill-of-skills
git log --oneline -1
# Should match local and GitHub
```

## Handling Sync Failures

### Scenario: Production is ahead of GitHub

```bash
# This should never happen, but if it does:
ssh aws1
cd /path/to/skill-of-skills

# Stash any uncommitted changes
git stash

# Reset to match GitHub
git fetch origin
git reset --hard origin/main

# Apply stashed changes (if needed)
git stash pop

# Or commit them properly:
git add .
git commit -m "Production hotfix"
git push origin main
```

### Scenario: Merge Conflicts

```bash
# On production after git pull fails with conflicts
git status  # View conflicting files

# Option 1: Accept GitHub version (recommended)
git checkout --theirs conflicting-file.js
git add conflicting-file.js
git commit -m "Resolved conflict - accepted GitHub version"

# Option 2: Accept local version (rare)
git checkout --ours conflicting-file.js
git add conflicting-file.js
git commit -m "Resolved conflict - kept production version"

# Push resolution to GitHub
git push origin main
```

## Feature Change Pattern

For multi-component features spanning n8n, database, UI, and docs:

```bash
# 1. Local: Make changes to all components
vim n8n-workflow.json
vim database/schema.sql
vim ui/components/Feature.js
vim docs/README.md

# 2. Local: Test end-to-end
npm test
npm run dev  # Test UI
# Test n8n workflow locally if possible

# 3. GitHub: Version control
git add .
git commit -m "feat: Add/remove feature X across all components

- Updated n8n workflow to ...
- Modified database schema to ...
- Updated UI to show/hide ...
- Updated documentation"

git push origin main

# 4. Production: Deploy
ssh aws1
cd /path/to/skill-of-skills

# Pull changes
git pull origin main

# Update database if schema changed
docker exec -it postgres psql -U skillmaster -d skill_of_skills -f database/migrations/001.sql

# Restart all affected services
docker-compose restart n8n webui

# Verify deployment
curl http://localhost:3001  # Check UI
# Check n8n workflows execute
```

## Service-Specific Restart Requirements

After syncing code to production, restart services based on what changed:

| Changed File | Restart Command |
|-------------|----------------|
| `docker-compose.yml` | `docker-compose down && docker-compose up -d` |
| n8n workflow files | `docker-compose restart n8n` |
| UI source code | `docker-compose restart webui` |
| Database schema | Restart not needed, apply migration |
| Environment variables | `docker-compose down && docker-compose up -d` |
| Static docs (README) | No restart needed |

## Common Mistakes to Avoid

1. **Making production changes without committing to GitHub**
   - Fix: Always push to GitHub immediately after production hotfix

2. **Pulling to production before pushing to GitHub**
   - Fix: Follow the order strictly

3. **Forgetting to restart services after sync**
   - Fix: Create deployment checklist

4. **Testing on production instead of local**
   - Fix: Always test locally first

## Automation Considerations

For future improvement, consider:

```bash
# Deploy script: deploy.sh
#!/bin/bash
set -e

echo "Deploying to production..."

# Ensure GitHub is up to date
git push origin main

# Deploy to production
ssh aws1 << 'EOF'
cd /path/to/skill-of-skills
git pull origin main
docker-compose restart
EOF

echo "Deployment complete"
```

## Related Patterns

- [Docker Environment Variables](./docker-env-vars-not-loading.md)
- [Deployment Validation Checklist](./deployment-validation.md)
- [Feature Removal Pattern](./multi-component-feature-changes.md)

## Tags

`git` `deployment` `sync` `multi-repo` `devops` `aws` `github` `version-control`
