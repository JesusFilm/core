#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces

cd /workspaces/core

pnpm setup --force

# add default user to postgres
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"

# install Nx CLI tool
pnpm install -g nx

# install Nest CLI tool
pnpm install -g @nestjs/cli@^8.1.5

# install Rover CLI tool
pnpm install -g @apollo/rover@0.23.0

# install Foreman CLI tool
pnpm install -g foreman

# install Apollo CLI tool for codegen
pnpm install -g apollo graphql

# install all dependencies
pnpm i

# install github action runner
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
sudo mv bin/act /usr/bin/
rm -rf bin

# install router to api gateways
# when updating router version you'll need to:
# - update .devcontainer/post-create-command.sh apollo router version (...nix/vX.X.X)
# - update app/api-gateway/Dockerfile image version (...router/vX.X.X)
# - inform all developers to rebuild their containers
curl -sSL https://router.apollo.dev/download/nix/v1.43.1 | sh
mv router apps/api-gateway/

# install doppler
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler