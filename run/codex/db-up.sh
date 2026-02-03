#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop and retry." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon does not appear to be running. Start Docker Desktop and retry." >&2
  exit 1
fi

if [ -f "$root_dir/.env.local" ]; then
  set -a
  # shellcheck disable=SC1091
  . "$root_dir/.env.local"
  set +a
fi

export CODEX_DB_PORT="${CODEX_DB_PORT:-5432}"

docker compose -f docker-compose.db.yml up -d

echo "DB started; host: localhost:${CODEX_DB_PORT}"
