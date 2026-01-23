#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "🧠 Skill of Skills - Manual Add"
  echo "================================"
  echo ""
  echo "Usage: $0 <github-url>"
  echo ""
  echo "Example:"
  echo "  $0 https://github.com/owner/repo"
  echo ""
  exit 1
fi

REPO_URL="$1"

# Validate URL format
if ! echo "$REPO_URL" | grep -qE "^https://github\.com/[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+"; then
  echo "❌ Invalid GitHub URL format"
  echo "   Expected: https://github.com/owner/repo"
  exit 1
fi

# Check if container is running
if ! docker ps | grep -q "skill-of-skills-db"; then
  echo "❌ PostgreSQL container is not running"
  echo "   Run ./scripts/setup.sh first"
  exit 1
fi

echo "🧠 Adding to discovery queue..."

# Add to queue
docker exec skill-of-skills-db psql -U dbuser -d skill_of_skills -c \
  "INSERT INTO discovery_queue (repo_url, source, status) VALUES ('$REPO_URL', 'manual_submission', 'pending') ON CONFLICT DO NOTHING;"

# Check if added
RESULT=$(docker exec skill-of-skills-db psql -U dbuser -d skill_of_skills -t -c \
  "SELECT id FROM discovery_queue WHERE repo_url = '$REPO_URL' LIMIT 1;")

if [ -n "$RESULT" ]; then
  echo "✅ Added to queue: $REPO_URL"
  echo ""
  echo "The tool will be validated on the next validator run (every 2 hours)"
  echo "or you can trigger it manually in n8n."
else
  echo "⚠️  Tool may already exist or URL is duplicate"
fi
