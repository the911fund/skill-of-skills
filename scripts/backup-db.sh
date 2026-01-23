#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_${TIMESTAMP}.sql"

echo "🧠 Skill of Skills - Database Backup"
echo "====================================="

# Check if container is running
if ! docker ps | grep -q "skill-of-skills-db"; then
  echo "❌ PostgreSQL container is not running"
  exit 1
fi

# Create backup directory if it doesn't exist
mkdir -p backups

# Perform backup
echo "📦 Creating backup..."
docker exec skill-of-skills-db pg_dump -U skillmaster skill_of_skills > "backups/${BACKUP_FILE}"

# Check backup size
BACKUP_SIZE=$(ls -lh "backups/${BACKUP_FILE}" | awk '{print $5}')

echo ""
echo "✅ Backup complete!"
echo "   File: backups/${BACKUP_FILE}"
echo "   Size: ${BACKUP_SIZE}"

# Keep only last 10 backups
echo ""
echo "🧹 Cleaning old backups..."
cd backups
ls -t backup_*.sql 2>/dev/null | tail -n +11 | xargs -r rm --
BACKUP_COUNT=$(ls backup_*.sql 2>/dev/null | wc -l)
echo "   Keeping ${BACKUP_COUNT} most recent backups"
