#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces

# add default user to postgres
psql -c "CREATE USER \"test-user\" WITH PASSWORD 'test-password' CREATEDB;"

# install Nx CLI tool
npm install -g nx

# install Rover CLI tool
./tools/scripts/install-rover.sh

# install all dependencies
npm i
