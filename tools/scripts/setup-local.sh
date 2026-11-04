#!/usr/bin/env bash
# Idempotent local setup for a host checkout (no dev container) — also the
# shared part of .devcontainer/post-create-command.sh. Safe to re-run.
#
#   pnpm setup:local              # all services incl. clickhouse + plausible (seeds plausible.sql)
#   pnpm setup:local --base       # only db, redis, serverless-redis-http, maildev
#   ... --no-services             # services are already running and managed
#                                 # elsewhere (the dev container): never touch
#                                 # docker compose, talk to postgres on localhost
#
# Requires: node >= 22 with corepack, docker with the compose plugin.
# Optional (checked, not installed): doppler, apollo (GraphQL codegen).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

ANALYTICS=true
MANAGE_SERVICES=true
for arg in "$@"; do
  case "$arg" in
    --base) ANALYTICS=false ;;
    --analytics) ANALYTICS=true ;; # default; kept for explicitness
    --no-services) MANAGE_SERVICES=false ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

compose=(docker compose -f docker-compose.services.yml)
if [ "$ANALYTICS" = true ]; then
  compose+=(--profile analytics)
fi

fail() { echo "❌ $*" >&2; exit 1; }
ok() { echo "✅ $*"; }
warn() { echo "⚠️  $*"; }

# --- prerequisites -----------------------------------------------------------
command -v node >/dev/null || fail "node not found. Install Node $(cat .nvmrc) (see .nvmrc)."
node_major="$(node -p 'process.versions.node.split(".")[0]')"
[ "$node_major" -ge "$(cat .nvmrc)" ] || fail "node $(node -v) found, need >= $(cat .nvmrc) (see .nvmrc)."
ok "node $(node -v)"

command -v corepack >/dev/null || fail "corepack not found. It ships with Node; enable it with 'corepack enable'."
corepack enable
ok "pnpm $(pnpm -v) via corepack (packageManager in package.json)"

if [ "$MANAGE_SERVICES" = true ]; then
  command -v docker >/dev/null || fail "docker not found. Install Docker (on Windows: Docker Desktop with WSL integration for this distro)."
  docker info >/dev/null 2>&1 || fail "docker daemon not reachable. Is Docker running / WSL integration enabled?"
  docker compose version >/dev/null 2>&1 || fail "docker compose plugin not found."
  ok "docker $(docker version --format '{{.Server.Version}}')"
else
  command -v psql >/dev/null || fail "psql not found (required with --no-services)."
fi

if command -v doppler >/dev/null; then
  ok "doppler $(doppler --version)"
else
  warn "doppler not found — needed for fetch-secrets. https://docs.doppler.com/docs/install-cli"
fi

if command -v apollo >/dev/null; then
  ok "apollo CLI (GraphQL codegen)"
else
  warn "apollo CLI not found — 'nx codegen <project>' will not work locally; install with 'npm i -g apollo graphql' (see AGENTS.md)."
fi

# --- backing services --------------------------------------------------------
# psql against the local db: through the container when we manage services
# (no host psql needed), directly over localhost when we do not.
pg() {
  if [ "$MANAGE_SERVICES" = true ]; then
    "${compose[@]}" exec -T db psql -U postgres "$@"
  else
    psql -h localhost -U postgres "$@"
  fi
}

if [ "$MANAGE_SERVICES" = true ]; then
  echo "Starting backing services..."
  "${compose[@]}" up -d --wait
  ok "services up"
else
  echo "Waiting for postgres on localhost..."
  for i in {1..30}; do
    pg_isready -h localhost -p 5432 -U postgres >/dev/null && break
    echo "Database not ready (try $i/30)…"
    sleep 2
  done
  pg_isready -h localhost -p 5432 -U postgres >/dev/null \
    || fail "Postgres failed to start"
  ok "postgres reachable"
fi

echo "Ensuring postgres test user..."
pg -v ON_ERROR_STOP=1 -q <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'test-user') THEN
    CREATE USER "test-user" WITH PASSWORD 'test-password' CREATEDB;
  END IF;
END
$$;
SQL
ok "postgres user test-user"

# --- dependencies ------------------------------------------------------------
echo "Installing project dependencies..."
pnpm install
ok "pnpm install"

# --- plausible ---------------------------------------------------------------
if [ "$ANALYTICS" = true ]; then
  echo "Setting up Plausible database..."
  # plausible creates plausible_db on first boot; wait for it before loading.
  for i in {1..30}; do
    pg -tAc "SELECT 1 FROM pg_database WHERE datname = 'plausible_db'" | grep -q 1 && break
    echo "plausible_db not ready (try $i/30)…"
    sleep 2
  done
  # plausible.sql is not idempotent (plain INSERTs), so only load it once.
  if pg -d plausible_db -tAc "SELECT 1 FROM users LIMIT 1" | grep -q 1; then
    ok "plausible_db already seeded"
  else
    # Single transaction so a partial seed cannot trip the guard above.
    pg -d plausible_db -v ON_ERROR_STOP=1 --single-transaction -q < .devcontainer/plausible.sql \
      || fail "Plausible DB bootstrap failed"
    ok "plausible_db seeded"
  fi
fi

echo
echo "Local setup complete. Next:"
echo "  DOPPLER_CONFIG=dev pnpm exec nx run-many --all --target=fetch-secrets"
echo "  pnpm exec nx run-many --target=prisma-migrate --projects=tag:prisma   # or per project"
echo "  pnpm dev:api    # backend via Procfile"
