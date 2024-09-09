#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces

cd /workspaces/core

# add default user to postgres
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"

# install Nx CLI tool
npm install -g nx

# install Nest CLI tool
npm install -g @nestjs/cli@^8.1.5

# install Rover CLI tool
npm install -g @apollo/rover@0.23.0

# install Foreman CLI tool
npm install -g foreman

# install Apollo CLI tool for codegen
npm install -g apollo graphql

# install all dependencies
npm i

# install router to api gateways
# when updating router version you'll need to:
# - update .devcontainer/post-create-command.sh apollo router version (...nix/vX.X.X)
# - update app/api-gateway/Dockerfile image version (...router/vX.X.X)
# - inform all developers to rebuild their containers
curl -sSL https://router.apollo.dev/download/nix/v1.53.0 | sh
mv router apps/api-gateway/

# update plausible db
psql -U postgres -h db -d plausible_db < .devcontainer/plausible.sql
