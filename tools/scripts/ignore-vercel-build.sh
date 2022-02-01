#!/bin/bash

# This script is used to ignore the vercel build. It should have a ENV APP_NAME set to the project name in Nx.
npm install -g npm@latest

# Determine version of Nx installed
NX_VERSION=$(node -e "console.log(require('./package.json').devDependencies['@nrwl/workspace'])")

# Install @nrwl/workspace in order to run the affected command
npm install -D @nrwl/workspace@$NX_VERSION --prefer-offline

# Run the affected command, comparing latest commit to the one before that
AFFECTED=$(npx nx affected:apps --plain --base HEAD~1 --head HEAD) 

echo "$AFFECTED" | grep $APP_NAME -q

# Store result of the previous command (grep)
IS_AFFECTED=$?

echo "APP_NAME: $APP_NAME"
echo "AFFECTED: $AFFECTED"
echo "NX_VERSION: $NX_VERSION"

if [ $IS_AFFECTED -eq 1 ]; then
  echo "🛑 - build cancelled"
  exit 0
elif [ $IS_AFFECTED -eq 0 ]; then
  echo "✅ - build can proceed"
  exit 1
fi
