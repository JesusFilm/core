#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

require_command() {
  local name="$1"
  if ! command -v "$name" >/dev/null 2>&1; then
    echo "Missing required command: $name" >&2
    return 1
  fi
}

echo "Verifying local prerequisites..."

require_command pnpm
require_command docker
require_command doppler

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon does not appear to be running. Start Docker Desktop and retry." >&2
  exit 1
fi

if ! doppler whoami >/dev/null 2>&1; then
  echo "Doppler CLI is not authenticated. Run 'doppler login' and retry." >&2
  exit 1
fi

if ! command -v nf >/dev/null 2>&1; then
  echo "Warning: 'nf' command not found. Actions that use 'nf start' will fail until it is installed." >&2
fi

echo "Verify OK."
