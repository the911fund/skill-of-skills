#!/bin/bash

# scripts/daily-compound-review.sh

# Runs BEFORE auto-compound.sh to update CLAUDE.md with learnings

cd ~/911fund/911fund_public_repos/skill-of-skills

# Source environment variables
if [ -f ".env.local" ]; then
  set -a
  source .env.local
  set +a
fi

# Ensure we're on main and up to date
git checkout main
git pull origin main

claude -p "Load the compound-engineering skill. Look through each Claude Code thread from the last 24 hours. For any thread where we did NOT use the Compound Engineering skill to compound our learnings at the end, do so now - extract the key learnings from that thread and update the relevant CLAUDE.md files so we can learn from our work and mistakes. Commit your changes and push to main." --dangerously-skip-permissions
