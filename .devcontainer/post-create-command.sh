#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node:node -R /workspaces
sudo chown node:node -R /home/node

cd /workspaces/core

# install bun CLI tool
curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.15"

# add default user to postgres
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"

# install Nx CLI tool
bun install -g nx

# install Nest CLI tool
bun install -g @nestjs/cli@^8.1.5

# install Foreman CLI tool
bun install -g foreman

# install Apollo CLI tool for codegen
bun install -g apollo graphql

# install all dependencies
bun i

# update plausible db
psql -U postgres -h db -d plausible_db < .devcontainer/plausible.sql
