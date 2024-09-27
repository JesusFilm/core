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

# install Foreman CLI tool
npm install -g foreman

# install Apollo CLI tool for codegen
npm install -g apollo graphql

# install all dependencies
npm i

# update plausible db
psql -U postgres -h db -d plausible_db < .devcontainer/plausible.sql
