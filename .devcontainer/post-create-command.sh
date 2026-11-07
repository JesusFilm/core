#!/bin/bash

set -e

echo "Starting post-create setup..."


cd "$(dirname "${BASH_SOURCE[0]}")/.."

# Shared with host checkouts: creates the postgres test user, pnpm install,
# seeds plausible_db. --no-services: compose is driven by the devcontainer
# CLI here; running `up` from inside would recreate db and drop this
# container's shared network namespace.
tools/scripts/setup-local.sh --no-services

# nx and foreman so the bare `nx ...` / `nf start` commands in the docs work (on a
# host checkout use `pnpm exec nx` / `pnpm dev:api` instead); apollo/graphql for
# `nx codegen` (deprecated CLI, cannot be a devDependency — see AGENTS.md). Keep
# the apollo/graphql pins in sync with .github/workflows/autofix.ci.yml.
echo "Installing global CLIs..."
npm i -g nx foreman apollo@2.34.0 graphql@16.10.0

echo "Post-create setup completed!"

# Configure Claude Code with bypassPermissions (container is the sandbox boundary)
echo "Configuring Claude Code..."
mkdir -p /home/node/.claude
cat > /home/node/.claude/settings.json << 'SETTINGS'
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "deny": [
      "Read(**/.env*)",
      "Read(**/.env.*)",
      "Bash(docker run*-v /*)",
      "Bash(docker run*--privileged*)"
    ]
  }
}
SETTINGS

# Skip onboarding wizard when auth token is pre-configured
if [ -n "${CLAUDE_CODE_OAUTH_TOKEN:-}" ] || [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  echo '{ "hasCompletedOnboarding": true }' > /home/node/.claude.json
fi
echo "Claude Code configured!"
