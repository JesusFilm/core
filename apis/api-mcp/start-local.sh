#!/usr/bin/env bash
set -euo pipefail
# Keep issuer, Firebase and database credentials out of the MCP process.
MCP_LOCAL_ENVIRONMENT=()
while IFS= read -r name; do
  case "$name" in
    PATH|HOME|PNPM_HOME|MCP_*) MCP_LOCAL_ENVIRONMENT+=("$name=${!name}") ;;
  esac
done < <(compgen -e)
case "${1:-serve}" in
  serve) exec env -i "${MCP_LOCAL_ENVIRONMENT[@]}" NX_LOAD_DOT_ENV_FILES=false pnpm exec tsx watch apis/api-mcp/src/index.ts ;;
  start) exec env -i "${MCP_LOCAL_ENVIRONMENT[@]}" NX_LOAD_DOT_ENV_FILES=false node dist/apis/api-mcp/main.cjs ;;
  *) exit 1 ;;
esac
