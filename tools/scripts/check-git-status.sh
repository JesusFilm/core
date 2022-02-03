#!/bin/bash

# this script is used by GitHub actions to check if changes were made by
# linting or codegen commands.

if [[ `git status --porcelain` ]]; then
  # Changes
  echo "🛑 - run codegen and linting locally and commit changes"
  exit 1
else
  # No changes
  echo "✅ - codegen and linting did not generate changes"
  exit 0
fi