#!/bin/bash

# this script is used by GitHub actions to check if branch name
# matches convention.

if [[ "$GITHUB_HEAD_REF" =~ ^main|[0-9]{2}-[0-9]{2}-[A-Z]{2}-(fix|chore|docs|feature|fix|security|testing)-[a-z\-]+[a-z]$ ]]; then
  echo "✅ - $GITHUB_HEAD_REF matches branch naming convention."
  exit 0
else
  echo "🛑 - $GITHUB_HEAD_REF does not match branch naming convention."
  echo "see https://github.com/JesusFilm/core/wiki/Repository-Best-Practice"
  exit 1
fi