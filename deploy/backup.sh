#!/usr/bin/env bash
# Nightly Postgres backup for the Pariksha Saathi VPS deployment.
# Dumps the `db` compose service to a timestamped, gzip-compressed file
# and prunes backups older than $RETENTION_DAYS.
#
# Install as a cron job on the HOST (not inside a container) so it
# survives `docker compose down`/rebuilds, e.g. via `crontab -e`:
#   0 2 * * * /opt/pariksha-saathi/deploy/backup.sh >> /var/log/ps-backup.log 2>&1
#
# Run from the project root (where docker-compose.yml lives), or set
# COMPOSE_PROJECT_DIR below.

set -euo pipefail

COMPOSE_PROJECT_DIR="${COMPOSE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
BACKUP_DIR="${BACKUP_DIR:-$COMPOSE_PROJECT_DIR/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"

cd "$COMPOSE_PROJECT_DIR"
mkdir -p "$BACKUP_DIR"

# shellcheck disable=SC1091
[ -f .env ] && set -a && source .env && set +a

POSTGRES_USER="${POSTGRES_USER:-pariksha}"
POSTGRES_DB="${POSTGRES_DB:-pariksha_saathi}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_FILE="$BACKUP_DIR/pariksha_saathi-$TIMESTAMP.sql.gz"

echo "[backup] dumping $POSTGRES_DB to $OUT_FILE"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$OUT_FILE"

echo "[backup] pruning backups older than $RETENTION_DAYS days"
find "$BACKUP_DIR" -name 'pariksha_saathi-*.sql.gz' -mtime "+$RETENTION_DAYS" -delete

echo "[backup] done: $(du -h "$OUT_FILE" | cut -f1)"
