#!/usr/bin/env bash

set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root_dir"

config="${1:-${DOPPLER_CONFIG:-dev}}"

if ! command -v doppler >/dev/null 2>&1; then
  echo "Doppler CLI is not installed. Install it and run 'doppler login'." >&2
  exit 1
fi

if ! doppler whoami >/dev/null 2>&1; then
  echo "Doppler CLI is not authenticated. Run 'doppler login' and retry." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is not installed. Install pnpm and retry." >&2
  exit 1
fi

if [ "$config" = "stg_dev" ]; then
  echo "Fetching secrets using DOPPLER_CONFIG=stg_dev (frontend-only projects)..."
  DOPPLER_CONFIG="$config" pnpm exec nx run-many --projects=tag:doppler_config:stg_dev --target=fetch-secrets
else
  echo "Fetching secrets using DOPPLER_CONFIG=$config (all projects)..."
  DOPPLER_CONFIG="$config" pnpm exec nx run-many --all --target=fetch-secrets
fi
