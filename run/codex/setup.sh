#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

env_file="$root_dir/.env.local"

ensure_env_local() {
  if [ -f "$env_file" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$env_file"
    set +a
  fi

  local host="${CODEX_DB_HOST:-localhost}"
  local port="${CODEX_DB_PORT:-5432}"

  if [ ! -f "$env_file" ]; then
    cat > "$env_file" <<EOF
# Codex host DB overrides (not committed)
CODEX_DB_HOST=${host}
CODEX_DB_PORT=${port}
PG_DATABASE_URL_JOURNEYS=postgresql://postgres:postgres@${host}:${port}/journeys?schema=public
PG_DATABASE_URL_USERS=postgresql://postgres:postgres@${host}:${port}/users?schema=public
PG_DATABASE_URL_LANGUAGES=postgresql://postgres:postgres@${host}:${port}/languages?schema=public
PG_DATABASE_URL_MEDIA=postgresql://postgres:postgres@${host}:${port}/media?schema=public
PG_DATABASE_URL_ANALYTICS=postgresql://postgres:postgres@${host}:${port}/analytics?schema=public
EOF
    echo "Created .env.local with localhost DB overrides."
    return
  fi

  upsert_env_key "CODEX_DB_HOST" "${host}" "$env_file"
  upsert_env_key "CODEX_DB_PORT" "${port}" "$env_file"
  upsert_env_key "PG_DATABASE_URL_JOURNEYS" "postgresql://postgres:postgres@${host}:${port}/journeys?schema=public" "$env_file"
  upsert_env_key "PG_DATABASE_URL_USERS" "postgresql://postgres:postgres@${host}:${port}/users?schema=public" "$env_file"
  upsert_env_key "PG_DATABASE_URL_LANGUAGES" "postgresql://postgres:postgres@${host}:${port}/languages?schema=public" "$env_file"
  upsert_env_key "PG_DATABASE_URL_MEDIA" "postgresql://postgres:postgres@${host}:${port}/media?schema=public" "$env_file"
  upsert_env_key "PG_DATABASE_URL_ANALYTICS" "postgresql://postgres:postgres@${host}:${port}/analytics?schema=public" "$env_file"
}

upsert_env_key() {
  local key="$1"
  local value="$2"
  local file="$3"

  if grep -q "^${key}=" "$file"; then
    local tmp_file
    tmp_file="$(mktemp -t codex-env-local.XXXXXX)"
    awk -v k="$key" -v v="$value" '
      $0 ~ "^"k"=" { print k"="v; next }
      { print }
    ' "$file" > "$tmp_file"
    mv "$tmp_file" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

echo "Starting Codex setup for ${root_dir} on $(date "+%Y-%m-%d %H:%M:%S")..."

echo "Installing dependencies..."
pnpm install

if command -v doppler >/dev/null 2>&1 && doppler whoami >/dev/null 2>&1; then
  ./run/codex/secrets.sh
else
  echo "Skipping Doppler secrets fetch (Doppler not installed or not authenticated)." >&2
fi

ensure_env_local
CODEX_SETUP=1 ./run/codex/db-fast.sh

./run/codex/verify.sh

echo "Codex setup complete."
echo "Next steps:"
echo "1. Start the shared DB: ./run/codex/db-up.sh"
echo "2. Run migrations + seeds: ./run/codex/db-fast.sh"
echo "3. Start services via Codex Actions (backend, journeys, watch)"
