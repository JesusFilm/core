#!/bin/bash

# this script is used by GitHub actions to check if our current branch is out of date with origin main

DIFF=$(git diff --name-only origin/$GITHUB_HEAD_REF...origin/$GITHUB_BASE_REF)

if [ ! -z "$DIFF" ]; then
  # Changes
  echo $DIFF
  echo "🛑 - branch is not updated to latest main"
  exit 1
else
  # No changes
  echo "✅ - branch is updated to latest main"
  exit 0
fi