#!/usr/bin/env bash
# ==============================================================================
# FoodSafe365 — Database Restore Script
# Usage:
#   TARGET_DATABASE_URL="postgresql://user:pass@host:5432/restore_db" \
#   ./scripts/restore.sh <path_to_backup_dump>
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"

if [[ -z "${BACKUP_FILE}" || ! -f "${BACKUP_FILE}" ]]; then
  echo "❌ Error: Backup dump file does not exist: '${BACKUP_FILE}'" >&2
  echo "Usage: TARGET_DATABASE_URL=... ./scripts/restore.sh <path_to_dump_file>" >&2
  exit 1
fi

if [[ -z "${TARGET_DATABASE_URL:-}" ]]; then
  echo "❌ Error: TARGET_DATABASE_URL environment variable is required." >&2
  exit 1
fi

# Guard against accidental restore into primary production database
if [[ "${TARGET_DATABASE_URL}" == *"prod"* && "${CONFIRM_RESTORE_PRODUCTION:-}" != "YES_I_AM_SURE" ]]; then
  echo "⚠️ SAFETY HALT: Target URL appears to be a production database." >&2
  echo "To proceed, you must set CONFIRM_RESTORE_PRODUCTION=YES_I_AM_SURE." >&2
  exit 1
fi

echo "================================================================"
echo "FOODSAFE365 — DATABASE RESTORE INITIATED"
echo "================================================================"
echo "Source Dump:  ${BACKUP_FILE}"

# Execute custom-format pg_restore
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --dbname="${TARGET_DATABASE_URL}" \
  "${BACKUP_FILE}"

echo "✅ Restore completed successfully."
echo "================================================================"
