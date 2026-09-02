#!/usr/bin/env bash
# Restores a Pariksha Saathi Postgres backup produced by backup.sh.
# Usage: ./deploy/restore.sh backups/pariksha_saathi-20260101-020000.sql.gz
#
# WARNING: this drops and recreates the target database — confirm you're
# pointed at the right environment before running it.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <path-to-backup.sql.gz>" >&2
  exit 1
fi
BACKUP_FILE="$1"
[ -f "$BACKUP_FILE" ] || { echo "File not found: $BACKUP_FILE" >&2; exit 1; }

COMPOSE_PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$COMPOSE_PROJECT_DIR"

# shellcheck disable=SC1091
[ -f .env ] && set -a && source .env && set +a
POSTGRES_USER="${POSTGRES_USER:-pariksha}"
POSTGRES_DB="${POSTGRES_DB:-pariksha_saathi}"

read -r -p "This will REPLACE all data in '$POSTGRES_DB'. Type the database name to confirm: " CONFIRM
if [ "$CONFIRM" != "$POSTGRES_DB" ]; then
  echo "Aborted."
  exit 1
fi

echo "[restore] stopping app so nothing writes during restore..."
docker compose stop app

echo "[restore] recreating database..."
docker compose exec -T db psql -U "$POSTGRES_USER" -d postgres -c "DROP DATABASE IF EXISTS \"$POSTGRES_DB\";"
docker compose exec -T db psql -U "$POSTGRES_USER" -d postgres -c "CREATE DATABASE \"$POSTGRES_DB\";"

echo "[restore] loading $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

echo "[restore] starting app..."
docker compose start app

echo "[restore] done."
