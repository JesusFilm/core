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
npm install -g @apollo/rover@0.10.0

# install Foreman CLI tool
npm install -g foreman

# install all dependencies
npm i

# install github action runner
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
sudo mv bin/act /usr/bin/
rm -rf bin

# install doppler
sudo apt-get update && sudo apt-get install -y apt-transport-https ca-certificates curl gnupg
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo apt-key add -
echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt-get update && sudo apt-get install doppler