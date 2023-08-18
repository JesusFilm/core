#!/bin/bash

# Determine version of Nx installed
NX_VERSION=$(node -e "console.log(require('./package.json').devDependencies['@nx/workspace'])")
TS_VERSION=$(node -e "console.log(require('./package.json').devDependencies['typescript'])")

# Install @nx/workspace in order to run the affected command
npm install --no-package-lock --no-save @nx/workspace@$NX_VERSION typescript@$TS_VERSION --prefer-offline

# Run the affected command, comparing latest commit to the one before that
AFFECTED=$(npx nx affected:apps --plain --base HEAD~1 --head HEAD)

echo "$AFFECTED" | grep $APP_NAME -q

# Store result of the previous command (grep)
IS_AFFECTED=$?

echo "APP_NAME: $APP_NAME"
echo "AFFECTED: $AFFECTED"

if [ $IS_AFFECTED -eq 1 ]; then
  echo "🛑 - Build cancelled"
  exit 0
elif [ $IS_AFFECTED -eq 0 ]; then
  echo "✅ - Build can proceed"
  exit 1
fi