#!/bin/bash

set -e

echo "Starting post-create setup..."


cd /workspaces/core

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

# install pnpm
echo "Installing pnpm..."
corepack enable && corepack prepare pnpm --activate

# install global CLIs
echo "Installing global CLIs..."
npm i -g nx @nestjs/cli@^8.1.5 foreman apollo graphql

echo "Installing rover..."
curl -sSL https://rover.apollo.dev/nix/v0.23.0 | sh

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

echo "Setting up CMS database..."
psql -U postgres -h db -tc "SELECT 1 FROM pg_database WHERE datname = 'cms'" | grep -q 1 \
  || psql -U postgres -h db -c "CREATE DATABASE cms;"

echo "Installing Argo CD..."
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd
rm argocd-linux-amd64