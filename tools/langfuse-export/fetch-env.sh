#!/usr/bin/env bash
# Populate tools/langfuse-export/.env from Doppler (core project, dev config).
# Mirrors the app `fetch-secrets` pattern. Runnable from any directory — the
# .env is written next to this script, not relative to the current directory.
#
# Required keys must exist in the core/dev Doppler config:
#   LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASE_URL, OPENROUTER_API_KEY
# Seed a missing key once, e.g.:
#   doppler secrets set OPENROUTER_API_KEY --project core --config dev
#
# The written .env holds live secrets and is gitignored. Delete it when done.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" && pwd)"
OUT="$SCRIPT_DIR/.env"

if ! command -v doppler >/dev/null 2>&1; then
  echo "doppler CLI not found. Install it and run \`doppler login\` first." >&2
  exit 1
fi

doppler secrets download --no-file --format=env-no-quotes \
  --project core --config dev > "$OUT"

echo "Wrote $OUT — delete it when you're done (it holds live secrets)."
