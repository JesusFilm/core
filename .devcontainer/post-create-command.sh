#!/bin/bash

set -e

echo "Starting post-create setup..."


cd /workspaces

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h db -p 5432 -U postgres; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done
echo "Database is ready!"

# add default user to postgres (with error handling)
echo "Creating test user in database..."
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;" || echo "User test-user might already exist"

# install Nx CLI tool
echo "Installing Nx CLI..."
npm install -g nx

# install Nest CLI tool
echo "Installing NestJS CLI..."
npm install -g @nestjs/cli@^8.1.5

# install Foreman CLI tool
echo "Installing Foreman CLI..."
npm install -g foreman

# install Apollo CLI tool for codegen
echo "Installing Apollo CLI..."
npm install -g apollo graphql

# install all dependencies
echo "Installing project dependencies..."
npm i

# update plausible db (with error handling)
echo "Setting up Plausible database..."
psql -U postgres -h db -d plausible_db < .devcontainer/plausible.sql || echo "Plausible database update might have failed"

echo "Post-create setup completed!"
