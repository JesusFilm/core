#!/bin/bash
# Compound reminder hook — checks if docs were created on this branch
# Runs before git push to remind about /ce-compound

BRANCH=$(git branch --show-current)

# Skip for main, stage, and sync branches
if [[ "$BRANCH" == "main" || "$BRANCH" == "stage" || "$BRANCH" == *"chore-ce-sync"* ]]; then
  exit 0
fi

# Check if this branch has any changes to docs/plans/ or docs/solutions/
DOCS_CHANGED=$(git diff main --name-only 2>/dev/null | grep -E "^docs/(plans|solutions)/" | head -1)

if [ -z "$DOCS_CHANGED" ]; then
  # Count non-trivial changed files (exclude generated, config, lock files)
  CHANGED_COUNT=$(git diff main --name-only 2>/dev/null | grep -vE "(\.generated\.|__generated__|pnpm-lock|\.json$|\.graphql$)" | wc -l)

  if [ "$CHANGED_COUNT" -gt 3 ]; then
    echo ""
    echo "📝 No plan or solution docs found on this branch."
    echo "   If this work involved non-obvious decisions or gotchas,"
    echo "   consider running /ce-compound before merging."
    echo ""
  fi
fi

exit 0
