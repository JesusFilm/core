#!/bin/bash

set -e

echo "Starting post-create setup..."


cd /workspaces/core.worktrees/main

# Wait for database to be ready
echo "Waiting for database to be ready..."
for i in {1..30}; do
  pg_isready -h db -p 5432 -U postgres && break
  echo "Database not ready (try $i/30)…"
  sleep 2
done
[ "$i" -eq 30 ] && { echo "Postgres failed to start"; exit 1; }
echo "Database is ready!"

# add default user to postgres (with error handling)
echo "Creating test user in database..."
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;" || echo "User test-user might already exist"

# install pnpm (no corepack)
echo "Installing pnpm..."
export PNPM_HOME="$HOME/.pnpm"
export PATH="$PNPM_HOME:$PATH"
curl -fsSL https://get.pnpm.io/install.sh | sh -s -- --version 10

# install global CLIs
echo "Installing global CLIs..."
pnpm add -g nx @nestjs/cli@^8.1.5 foreman apollo graphql

# install all dependencies
echo "Installing project dependencies..."
pnpm install

# update plausible db (with error handling)
echo "Setting up Plausible database..."
if ! psql -h db -U postgres -d plausible_db < .devcontainer/plausible.sql; then
  echo "❌ Plausible DB bootstrap failed" >&2
  exit 1
fi
echo "Post-create setup completed!"
