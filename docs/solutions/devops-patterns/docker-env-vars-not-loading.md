---
title: Docker Environment Variables Not Loading After Update
category: devops-patterns
tags: [docker, environment-variables, containers, n8n]
symptoms: [500 error, missing API key, configuration not loaded]
date: 2026-02-01
---

# Docker Environment Variables Not Loading After Update

## Problem

After adding environment variables (like `ANTHROPIC_API_KEY`) to `docker-compose.yml`, services running in containers still report missing configuration or API key errors (500 errors in n8n workflows).

## Symptoms

- Added environment variable to `docker-compose.yml`
- Workflow execution fails with 500 error
- Error message indicates missing API key or configuration
- `docker-compose logs` shows the service started before env var was added

## Root Cause

Docker containers do **not** automatically reload environment variables when `docker-compose.yml` is modified. Running containers maintain their startup environment until they are recreated.

Simply editing `docker-compose.yml` and running `docker-compose up` will NOT update existing containers.

## Solution

After modifying environment variables in `docker-compose.yml`, you must restart the containers:

```bash
# Method 1: Restart all services (recommended)
docker-compose down
docker-compose up -d

# Method 2: Restart specific service
docker-compose restart service-name

# Method 3: Recreate containers (most thorough)
docker-compose down
docker-compose up -d --force-recreate
```

## Investigation Steps

When you encounter "missing configuration" errors:

1. Check if env var exists in docker-compose.yml:
   ```bash
   grep -i "anthropic" docker-compose.yml
   ```

2. Check when container was last started:
   ```bash
   docker ps --format "table {{.Names}}\t{{.Status}}"
   ```

3. If container is older than env var change, restart is needed

4. Verify env var loaded after restart:
   ```bash
   docker exec container-name env | grep ANTHROPIC
   ```

## Prevention

**Best Practice**: Always restart containers after modifying environment configuration.

Make it a habit:
```bash
# Your workflow should be:
vim docker-compose.yml           # Edit config
docker-compose down              # Stop containers
docker-compose up -d             # Recreate with new config
docker-compose logs -f service   # Verify startup
```

## Example from skill-of-skills Project

**Context**: n8n workflow on AWS needed Anthropic API key for AI categorization.

**What Happened**:
1. Added `ANTHROPIC_API_KEY` to docker-compose.yml
2. Ran n8n workflow
3. Got 500 error: "Missing API key"
4. Realized container was still using old environment

**Fix**:
```bash
ssh aws1
cd /path/to/project
docker-compose down
docker-compose up -d
# Workflow now executes successfully
```

## Related Issues

- Service configuration changes not taking effect
- Database connection strings not updating
- Feature flags not loading
- Secrets not available to containerized apps

## Tags

`docker` `docker-compose` `environment-variables` `containers` `devops` `n8n` `troubleshooting`
