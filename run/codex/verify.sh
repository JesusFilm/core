#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required command: $name" >&2
    return 1
  fi
}

require_nx() {
  if command -v nx >/dev/null 2>&1; then
    return 0
  fi
  if command -v pnpm >/dev/null 2>&1 && pnpm exec nx --version >/dev/null 2>&1; then
    return 0
  fi
  echo "Missing required command: nx (install it or use pnpm exec nx)" >&2
  return 1
}

load_env_local() {
  if [ -f "$root_dir/.env.local" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$root_dir/.env.local"
    set +a
  fi
}

db_reachable() {
  local host="${CODEX_DB_HOST:-localhost}"
  local port="${CODEX_DB_PORT:-5432}"

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

echo "Verifying local prerequisites..."

require_command node
require_command pnpm
require_nx
require_command docker

docker_ready=true
if ! docker info >/dev/null 2>&1; then
  echo "Warning: Docker daemon does not appear to be running. Start Docker Desktop to use the shared DB." >&2
  docker_ready=false
fi

if command -v doppler >/dev/null 2>&1; then
  if ! doppler whoami >/dev/null 2>&1; then
    echo "Warning: Doppler CLI is not authenticated. Secrets fetch will fail until you run 'doppler login'." >&2
  fi
else
  echo "Warning: Doppler CLI is not installed. Secrets fetch will be skipped." >&2
fi

if ! command -v nf >/dev/null 2>&1; then
  echo "Warning: 'nf' command not found. Actions that use 'nf start' will fail until it is installed." >&2
fi

load_env_local
db_ready=true
if ! db_reachable; then
  echo "Warning: Database is not reachable at ${CODEX_DB_HOST:-localhost}:${CODEX_DB_PORT:-5432}." >&2
  db_ready=false
fi

echo "Verify summary:"
echo "Docker running: ${docker_ready}"
echo "DB reachable: ${db_ready}"
echo "Verify OK."
