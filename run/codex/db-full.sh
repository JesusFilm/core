#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not installed. Install pnpm and retry." >&2
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop and retry." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon does not appear to be running. Start Docker Desktop and retry." >&2
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
if [ "$current_branch" != "main" ] && [ -n "$current_branch" ]; then
  echo "Warning: data-import is recommended from the main branch. Current branch: $current_branch" >&2
fi

echo "Running data-import (can take ~12 minutes)..."
pnpm exec nx run-many --target=data-import
