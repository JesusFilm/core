#!/bin/bash

set -e

echo "Starting post-create setup..."


cd /workspaces/core

# install pnpm
echo "Installing pnpm..."
corepack enable && corepack prepare pnpm --activate

# install all dependencies
echo "Installing project dependencies..."
pnpm install

echo "Post-create setup completed!"
