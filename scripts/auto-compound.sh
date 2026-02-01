#!/bin/bash

# scripts/auto-compound.sh

# Runs AFTER daily-compound-review.sh to implement #1 priority from reports
# The compound review job updates AGENTS.md with learnings first,
# then this job benefits from those learnings when implementing.

cd ~/911fund/911fund_public_repos/skill-of-skills

# Ensure we're on main and up to date (with fresh learnings from review job)
git checkout main
git pull origin main

# Run the full compound pipeline
./scripts/compound/auto-compound.sh
