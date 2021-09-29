#!/bin/bash

# This script is used to ignore the vercel build. It should have a ENV APP_NAME set to the project name in Nx.

# Determine version of Nx installed
NX_VERSION=$(node -e "console.log(require('./package.json').devDependencies['@nrwl/workspace'])")

# Run the affected command, comparing latest commit to the one before that
npx --package=@nrwl/workspace@$NX_VERSION -- nx affected:apps --plain --base HEAD~1 --head HEAD | grep $APP_NAME -q

# Store result of the previous command (grep)
IS_AFFECTED=$?

if [ $IS_AFFECTED -eq 1 ]; then
  echo "🛑 - Build cancelled"
  exit 0
elif [ $IS_AFFECTED -eq 0 ]; then
  echo "✅ - Build can proceed"
  exit 1
fi
