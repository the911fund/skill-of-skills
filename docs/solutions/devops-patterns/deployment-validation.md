---
title: Deployment Validation Checklist for skills.911fund.io
category: devops-patterns
tags: [deployment, validation, checklist, testing]
symptoms: [deployment failures, silent errors, configuration drift]
date: 2026-02-01
---

# Deployment Validation Checklist for skills.911fund.io

## Problem

Deploying changes without proper validation leads to:
- Silent failures (code deployed but not working)
- Security vulnerabilities (API keys committed)
- Configuration drift (repos out of sync)
- Broken user experience

## Solution: Comprehensive Validation Checklist

Use this checklist **before** considering any deployment complete.

## Pre-Deployment Validation

### 1. Security Audit

Check for sensitive data before pushing to GitHub:

```bash
# Search for common secrets
grep -r "sk-ant-api" . --exclude-dir=node_modules
grep -r "password" . --exclude-dir=node_modules --exclude-dir=docs
grep -r "api.*key" . --exclude-dir=node_modules --exclude-dir=docs
grep -r "secret" . --exclude-dir=node_modules

# Check git history for accidentally committed secrets
git log --all --pretty=format: --name-only --diff-filter=A | sort -u | grep -i "\.env"

# Check for large files that shouldn't be in git
find . -type f -size +10M | grep -v node_modules

# Verify .gitignore is working
git status --ignored
```

**Checklist**:
- [ ] No API keys in code
- [ ] No passwords in configuration
- [ ] .env files not committed
- [ ] Database credentials not exposed
- [ ] No large binary files committed
- [ ] Secrets in environment variables or secure vault

### 2. Code Quality

```bash
# Run linter if available
npm run lint

# Run tests
npm test

# Check for console.log statements (remove before production)
grep -r "console.log" src/ --exclude-dir=node_modules

# Validate JSON files
find . -name "*.json" -not -path "./node_modules/*" -exec json_pp {} \; > /dev/null
```

**Checklist**:
- [ ] All tests passing
- [ ] No linting errors
- [ ] No debug console.log statements
- [ ] JSON files are valid
- [ ] No commented-out code blocks

### 3. Documentation

```bash
# Check README is up to date
git diff README.md

# Verify links work
# (Manual check or use link checker tool)

# Spell check
aspell check README.md
```

**Checklist**:
- [ ] README reflects current functionality
- [ ] Removed documentation for removed features
- [ ] Added documentation for new features
- [ ] Links are valid
- [ ] No spelling errors
- [ ] Code examples work

## Deployment Process

### 1. Local Git

```bash
git status
# Should show clean working directory or only intended changes

git add .
git commit -m "Descriptive commit message"
# Commit message should explain what and why

git log --oneline -1
# Note the commit hash for verification later
```

**Checklist**:
- [ ] Only intended files staged
- [ ] Descriptive commit message
- [ ] Commit hash noted

### 2. Push to GitHub

```bash
git push origin main

# Verify push succeeded
git log origin/main --oneline -1
# Should match local commit hash
```

**Checklist**:
- [ ] Push succeeded without errors
- [ ] GitHub shows latest commit
- [ ] GitHub Actions passing (if configured)

### 3. Sync to Production

```bash
ssh aws1

cd /path/to/skill-of-skills

# Check current state
git status
git log --oneline -1

# Pull latest
git pull origin main

# Note new commit hash
git log --oneline -1
# Should match GitHub and local
```

**Checklist**:
- [ ] Production repo was clean before pull
- [ ] Pull succeeded without conflicts
- [ ] Commit hashes match across all repos

### 4. Service Restart (if needed)

Based on what changed, restart appropriate services:

```bash
# If docker-compose.yml or env vars changed
docker-compose down
docker-compose up -d

# If only code changed
docker-compose restart webui

# If n8n workflows changed
docker-compose restart n8n

# If database schema changed
docker exec -it postgres psql -U skillmaster -d skill_of_skills -f database/migrations/xxx.sql
```

**Checklist**:
- [ ] Identified which services need restart
- [ ] Restarted services in correct order
- [ ] No errors during restart
- [ ] All containers running

## Post-Deployment Validation

### 1. Service Health Checks

```bash
# Check container status
docker ps
# All containers should show "Up" status

# Check container logs for errors
docker-compose logs --tail=50 webui
docker-compose logs --tail=50 n8n
docker-compose logs --tail=50 postgres

# Look for:
# - Startup messages
# - No error traces
# - Service ready messages
```

**Checklist**:
- [ ] All containers running
- [ ] No errors in logs
- [ ] Services report "ready"

### 2. Web UI Validation

```bash
# Basic health check
curl -I http://100.106.247.46:3001
# Expected: HTTP/1.1 200 OK

# Full page check
curl http://100.106.247.46:3001 | grep -i "skill"
# Should return HTML with skills content

# Check from browser
# Visit http://skills.911fund.io
```

**Browser Checklist**:
- [ ] Page loads without errors
- [ ] No JavaScript console errors
- [ ] Skills displayed correctly
- [ ] Categories working
- [ ] Search functioning (if applicable)
- [ ] Responsive design working
- [ ] No broken images or links

### 3. Database Validation

```bash
# Connect to database
docker exec -it postgres psql -U skillmaster -d skill_of_skills

# Check skill count
SELECT COUNT(*) FROM skills;

# Check recent skills
SELECT id, name, category, created_at
FROM skills
ORDER BY created_at DESC
LIMIT 5;

# Verify schema changes (if applicable)
\d+ skills

# Check for orphaned data
# (Queries depend on schema changes)
```

**Checklist**:
- [ ] Database connection works
- [ ] Expected number of skills
- [ ] Recent skills present
- [ ] Schema matches migration
- [ ] No orphaned records

### 4. n8n Workflow Validation

```bash
# Access n8n UI
# Visit http://100.106.247.46:5679

# Check workflows:
# 1. Skill Discovery - Should be active
# 2. AI Categorization - Should be active
# 3. Database Sync - Should be active
# 4. GitHub Update - Should be active
# 5. Removed workflows - Should be inactive/deleted

# Check recent executions
# View execution history
# Look for successful recent runs
```

**Checklist**:
- [ ] n8n UI accessible
- [ ] Active workflows showing "active" status
- [ ] Recent executions successful
- [ ] No failed executions
- [ ] Schedules configured correctly
- [ ] Removed workflows unpublished

### 5. GitHub Integration

```bash
# Check GitHub repository
# Visit https://github.com/the911fund/skill-of-skills

# Verify:
# - Latest commit matches deployment
# - README reflects current state
# - No sensitive data exposed
# - Actions/workflows passing
```

**Checklist**:
- [ ] GitHub shows latest commit
- [ ] README up to date
- [ ] No secrets exposed
- [ ] Actions passing (if configured)

### 6. End-to-End Test

Validate the entire pipeline:

```bash
# Option 1: Wait for scheduled run
# Check when next n8n workflow scheduled to run
# Wait and observe results

# Option 2: Manual trigger (if available)
# Trigger skill discovery workflow manually
# Monitor execution through each stage
```

**E2E Checklist**:
- [ ] Workflow discovers new skill
- [ ] AI categorization executes
- [ ] Skill saved to database
- [ ] GitHub README updated
- [ ] Web UI shows new skill
- [ ] Process completes without errors

## Repository Sync Verification

Ensure all three repos match:

```bash
# === LOCAL ===
cd /Users/pw/911fund/911fund_public_repos/skill-of-skills
git log --oneline -1
# Output: abc1234 feat: Remove trending score

# === GITHUB ===
# Visit https://github.com/the911fund/skill-of-skills/commits/main
# Latest commit should match: abc1234

# === PRODUCTION ===
ssh aws1
cd /path/to/skill-of-skills
git log --oneline -1
# Output: abc1234 feat: Remove trending score
```

**Checklist**:
- [ ] All three repos show same commit hash
- [ ] No uncommitted changes locally
- [ ] No uncommitted changes on production
- [ ] Git status clean everywhere

## Common Issues and Fixes

### Issue: Web UI Returns 502

**Diagnosis**:
```bash
docker ps  # Check container status
docker-compose logs webui  # Check for errors
```

**Common Causes**:
- Container not running → `docker-compose up -d`
- Code syntax error → Check logs, fix code
- Port conflict → Check port bindings

### Issue: n8n Workflow Fails

**Diagnosis**:
```bash
docker-compose logs n8n
# Check execution logs in n8n UI
```

**Common Causes**:
- Missing environment variable → Check docker-compose.yml, restart
- API rate limit → Wait and retry
- Invalid workflow logic → Review workflow nodes

### Issue: Database Connection Failed

**Diagnosis**:
```bash
docker ps | grep postgres
docker exec -it postgres psql -U skillmaster -d skill_of_skills
```

**Common Causes**:
- Container not running → `docker-compose up -d postgres`
- Wrong credentials → Check docker-compose.yml
- Network issue → Check docker network

### Issue: GitHub README Not Updating

**Diagnosis**:
- Check n8n GitHub update workflow execution
- Verify GitHub token has write permissions
- Check workflow schedule

**Fix**:
```bash
# Manually trigger workflow
# Or update token permissions in GitHub settings
```

## Rollback Procedure

If deployment fails validation:

```bash
# === On Production ===
ssh aws1
cd /path/to/skill-of-skills

# Check previous commit
git log --oneline -5

# Rollback to previous version
git reset --hard HEAD~1

# Restart services
docker-compose restart

# Verify rollback worked
git log --oneline -1
curl -I http://100.106.247.46:3001
```

**Rollback Checklist**:
- [ ] Identified last known good commit
- [ ] Reset to that commit
- [ ] Restarted services
- [ ] Verified services working
- [ ] Documented what failed
- [ ] Created fix plan

## Monitoring Setup

For continuous validation, set up monitoring:

```bash
# Simple uptime check
*/5 * * * * curl -f http://100.106.247.46:3001 || echo "Web UI down"

# Database health check
*/15 * * * * docker exec postgres pg_isready -U skillmaster

# Workflow execution monitoring
# Check n8n execution history via API
```

## Related Patterns

- [Multi-Repo Sync Pattern](./multi-repo-sync-pattern.md)
- [Multi-Component Feature Changes](./multi-component-feature-changes.md)
- [Docker Environment Variables](./docker-env-vars-not-loading.md)

## Tags

`deployment` `validation` `checklist` `testing` `devops` `monitoring` `rollback`
