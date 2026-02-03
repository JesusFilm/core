#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

echo "Starting Codex setup..."

./run/codex/verify.sh

echo "Installing dependencies..."
pnpm install

./run/codex/secrets.sh
./run/codex/db-fast.sh

echo "Codex setup complete."
