#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces

cd /workspaces/core

# install bun CLI tool
curl -fsSL https://bun.sh/install | bash -s "bun-v1.1.16"
git config diff.lockb.textconv bun
git config diff.lockb.binary true

# add default user to postgres
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"

# install Nx CLI tool
bun install -g nx

# install Nest CLI tool
bun install -g @nestjs/cli@^8.1.5

# install Rover CLI tool
bun install -g @apollo/rover@0.23.0

# install Foreman CLI tool
bun install -g foreman

# install Apollo CLI tool for codegen
bun install -g apollo graphql

# install all dependencies
rm -rf /workspaces/core/node_modules
bun i

# install router to api gateways
# when updating router version you'll need to:
# - update .devcontainer/post-create-command.sh apollo router version (...nix/vX.X.X)
# - update app/api-gateway/Dockerfile image version (...router/vX.X.X)
# - inform all developers to rebuild their containers
curl -sSL https://router.apollo.dev/download/nix/v1.43.1 | sh
mv router apps/api-gateway/

# update plausible db
psql -U postgres -h db -d plausible_db < .devcontainer/plausible.sql

# generate prisma clients
bunx nx run-many --all --target=prisma-generate --parallel=1
