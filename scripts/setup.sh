#!/bin/bash
set -e

echo "🧠 Skill of Skills - Setup"
echo "=========================="

# Check Docker
command -v docker >/dev/null 2>&1 || { echo "❌ Docker required. Install from https://docker.com"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { echo "❌ Docker Compose required"; exit 1; }

echo "✅ Docker found"

# Check for .env file
if [ ! -f docker/.env ]; then
  cp docker/.env.example docker/.env
  echo ""
  echo "⚠️  Created docker/.env from template"
  echo "   Please edit docker/.env with your API keys:"
  echo "   - GITHUB_TOKEN"
  echo "   - X_BEARER_TOKEN"
  echo "   - ANTHROPIC_API_KEY"
  echo ""
  echo "   Then run this script again."
  exit 1
fi

echo "✅ Environment file found"

# Start services
echo ""
echo "🚀 Starting services..."
cd docker

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up -d
else
  docker compose up -d
fi

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are running
if docker ps | grep -q "skill-of-skills-n8n"; then
  echo "✅ n8n is running"
else
  echo "❌ n8n failed to start"
  docker logs skill-of-skills-n8n 2>&1 | tail -20
  exit 1
fi

if docker ps | grep -q "skill-of-skills-db"; then
  echo "✅ PostgreSQL is running"
else
  echo "❌ PostgreSQL failed to start"
  docker logs skill-of-skills-db 2>&1 | tail -20
  exit 1
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Open http://localhost:5678 in your browser"
echo "   2. Log in with credentials from docker/.env"
echo "   3. Import workflows from n8n-workflows/*.json"
echo "   4. Configure credentials in n8n:"
echo "      - GitHub Token (Header Auth)"
echo "      - X Bearer Token (Header Auth)"
echo "      - Anthropic API Key (Header Auth)"
echo "      - PostgreSQL connection"
echo "   5. Update credential IDs in workflow nodes"
echo "   6. Activate all workflows"
echo ""
echo "🧠 Skill of Skills is ready!"
