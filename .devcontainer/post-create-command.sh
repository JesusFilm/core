#!/bin/bash

# Change permissions of files in workspace to match primary user
sudo chown node -R /workspaces
sudo chgrp node -R /workspaces

# install Nx CLI tool
npm install -g nx

# install Nest CLI tool
npm install -g @nestjs/cli@^8.1.5

# install Rover CLI tool
./tools/scripts/install-rover.sh

install aws cli tools
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm awscliv2.zip
rm -rf aws

# install kubectl
curl -LO https://dl.k8s.io/release/v1.22.0/bin/linux/amd64/kubectl
chmod 775 kubectl
sudo mv kubectl /usr/local/bin

# install all dependencies
npm i
