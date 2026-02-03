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

echo "Running prisma-generate (serial)..."
pnpm exec nx run-many --target=prisma-generate --parallel=1

echo "Running prisma-migrate..."
pnpm exec nx run-many --target=prisma-migrate

echo "Running prisma-seed..."
pnpm exec nx run-many --target=prisma-seed
