#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

load_env_local() {
  if [ -f "$root_dir/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$root_dir/.env.local"
    set +a
  fi
}

db_reachable() {
  local host="$1"
  local port="$2"

  if command -v nc >/dev/null 2>&1; then
    nc -z "$host" "$port" >/dev/null 2>&1
    return $?
  fi

  if (exec 3<>"/dev/tcp/${host}/${port}") >/dev/null 2>&1; then
    exec 3<&- 3>&-
    return 0
  fi

  return 1
}

load_env_local

export CODEX_DB_HOST="${CODEX_DB_HOST:-localhost}"
export CODEX_DB_PORT="${CODEX_DB_PORT:-5432}"
export CODEX_HOST_DB=1
export DOPPLER_CONFIG=dev

export PG_DATABASE_URL_JOURNEYS="${PG_DATABASE_URL_JOURNEYS:-postgresql://postgres:postgres@${CODEX_DB_HOST}:${CODEX_DB_PORT}/journeys?schema=public}"
export PG_DATABASE_URL_USERS="${PG_DATABASE_URL_USERS:-postgresql://postgres:postgres@${CODEX_DB_HOST}:${CODEX_DB_PORT}/users?schema=public}"
export PG_DATABASE_URL_LANGUAGES="${PG_DATABASE_URL_LANGUAGES:-postgresql://postgres:postgres@${CODEX_DB_HOST}:${CODEX_DB_PORT}/languages?schema=public}"
export PG_DATABASE_URL_MEDIA="${PG_DATABASE_URL_MEDIA:-postgresql://postgres:postgres@${CODEX_DB_HOST}:${CODEX_DB_PORT}/media?schema=public}"
export PG_DATABASE_URL_ANALYTICS="${PG_DATABASE_URL_ANALYTICS:-postgresql://postgres:postgres@${CODEX_DB_HOST}:${CODEX_DB_PORT}/analytics?schema=public}"

if ! db_reachable "$CODEX_DB_HOST" "$CODEX_DB_PORT"; then
  echo "Database is not reachable at ${CODEX_DB_HOST}:${CODEX_DB_PORT}." >&2
  if [ "${CODEX_SETUP:-}" = "1" ]; then
    echo "Skipping DB steps during setup. Start the DB and run ./run/codex/db-fast.sh when ready." >&2
    exit 0
  fi
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not installed. Install pnpm and retry." >&2
  exit 1
fi

echo "Running prisma-generate (serial)..."
pnpm exec nx run-many --target=prisma-generate --parallel=1

echo "Running prisma-migrate..."
pnpm exec nx run-many --target=prisma-migrate

echo "Running prisma-seed..."
pnpm exec nx run-many --target=prisma-seed
