#!/usr/bin/env bash
# ==============================================================================
# FoodSafe365 — Automated Logical Database Backup Script
# Usage:
#   DATABASE_URL="postgresql://user:pass@host:5432/db" ./scripts/backup.sh [output_path]
# ==============================================================================
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "❌ Error: DATABASE_URL environment variable is required." >&2
  exit 1
fi

TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
DEFAULT_DIR="/tmp/foodsafe365_backups"
mkdir -p "${DEFAULT_DIR}"

OUTPUT_FILE="${1:-${DEFAULT_DIR}/foodsafe365_backup_${TIMESTAMP}.dump}"

echo "================================================================"
echo "FOODSAFE365 — DATABASE BACKUP INITIATED"
echo "================================================================"
echo "Timestamp:    ${TIMESTAMP}"
echo "Output Path:  ${OUTPUT_FILE}"

# Execute custom-format compressed pg_dump
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="${OUTPUT_FILE}" \
  "${DATABASE_URL}"

FILE_SIZE=$(du -h "${OUTPUT_FILE}" | cut -f1)
echo "✅ Backup completed successfully. Size: ${FILE_SIZE}"
echo "================================================================"
