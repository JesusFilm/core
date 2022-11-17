#!/bin/bash

# this script is used by GitHub actions to check if our current branch is out of date with its base branch. Most commonly origin main, or a feature branch.

DIFF=$(git diff --name-only origin/$GITHUB_HEAD_REF...origin/$GITHUB_BASE_REF)

if [ ! -z "$DIFF" ]; then
  # Changes
  echo "🛑 - branch not updated to latest base"
  echo "Missing files:"
  echo  $DIFF \ | tr " " "\n" 
  exit 1
else
  # No changes
  echo "✅ - branch is updated to latest base"
  echo  $DIFF \ | tr " " "\n"
  exit 0
fi