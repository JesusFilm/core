#!/bin/bash

# this script is designed to run on Vercel build step (Amazon Linux 2)

# install doppler
if hash yum 2>/dev/null; then
  rpm --import 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key'
  curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/config.rpm.txt' | tee /etc/yum.repos.d/doppler-cli.repo
  yum install doppler -y
fi

# fetch secrets from doppler
npx nx fetch-secrets $APP_NAME

# build project
npx nx build $APP_NAME --prod