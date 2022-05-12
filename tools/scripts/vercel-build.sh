#!/bin/bash

# this script is designed to run on Vercel build step (Amazon Linux 2)

# install doppler
sudo rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | sudo tee /etc/yum.repos.d/doppler-cli.repo
sudo yum update && sudo yum install doppler

# fetch secrets from doppler
npx nx fetch-secrets $NX_PROJECT

# build project
npx nx build $NX_PROJECT --prod