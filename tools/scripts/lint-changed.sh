#!/bin/bash

# Lint only changed files (full `nx lint` is far too slow for commit-time feedback).
# Groups files by their nearest eslint.config.mjs and runs ESLint once per
# workspace from the repo root with --config, which is how flat-config path
# patterns like 'apps/journeys-admin/**' resolve correctly (with --config the
# pattern base is the cwd). Workspaces are linted in parallel.
#
# Usage:
#   tools/scripts/lint-changed.sh              # all changes vs merge-base with origin/main (incl. uncommitted + untracked)
#   tools/scripts/lint-changed.sh --committed  # committed changes only (what a push would send); refreshes origin/main first
#   tools/scripts/lint-changed.sh --staged     # staged files only (lints their working-tree contents)
#   tools/scripts/lint-changed.sh --fix        # apply autofixes (after --staged --fix, re-stage the fixed files yourself)
#
# Expect roughly 5-20s per touched workspace: type-aware lint rules build a
# TypeScript program per workspace on every run. That is why the only hook on
# this is the agent-gated pre-push (.husky/pre-push), not a per-commit hook.

set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

MODE=all
FIX_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --staged | --committed)
      if [ "$MODE" != "all" ]; then
        echo "conflicting options: --$MODE and $arg" >&2
        exit 2
      fi
      MODE="${arg#--}"
      ;;
    --fix) FIX_ARGS=(--fix) ;;
    *)
      echo "unknown option: $arg" >&2
      echo "usage: tools/scripts/lint-changed.sh [--staged|--committed] [--fix]" >&2
      exit 2
      ;;
  esac
done

resolve_base() {
  if [ "$MODE" = "committed" ]; then
    # refresh the ref the push will be judged against; tolerate being offline
    git fetch origin main --quiet 2>/dev/null || true
  fi
  if ! BASE=$(git merge-base HEAD origin/main 2>/dev/null); then
    echo "🛑 - could not resolve merge-base with origin/main" >&2
    echo "    run \`git fetch origin main\` and check that the 'origin' remote exists" >&2
    exit 1
  fi
}

if [ "$MODE" = "staged" ]; then
  RAW=$(git diff --name-only --cached --diff-filter=ACMR)
elif [ "$MODE" = "committed" ]; then
  resolve_base
  RAW=$(git diff --name-only --diff-filter=ACMR "$BASE" HEAD)
else
  resolve_base
  RAW=$(
    {
      git diff --name-only --diff-filter=ACMR "$BASE"
      git ls-files --others --exclude-standard
    } | sort -u
  )
fi

# group lintable files by their nearest workspace eslint config; parallel
# arrays because macOS ships bash 3.2 (no associative arrays)
WS_LIST=()
WS_FILES=() # newline-joined file list per WS_LIST entry
SKIPPED=()
while IFS= read -r f; do
  if [ -z "$f" ]; then continue; fi
  case "$f" in
    *.ts | *.tsx | *.js | *.jsx | *.cjs | *.mjs) ;;
    *) continue ;;
  esac
  if [ ! -f "$f" ]; then continue; fi
  d=$(dirname "$f")
  ws=""
  while [ "$d" != "." ] && [ "$d" != "/" ]; do
    if [ -f "$d/eslint.config.mjs" ]; then
      ws="$d"
      break
    fi
    d=$(dirname "$d")
  done
  if [ -z "$ws" ]; then
    SKIPPED+=("$f")
    continue
  fi
  idx=-1
  i=0
  for existing in ${WS_LIST[@]+"${WS_LIST[@]}"}; do
    if [ "$existing" = "$ws" ]; then
      idx=$i
      break
    fi
    i=$((i + 1))
  done
  if [ "$idx" -eq -1 ]; then
    WS_LIST+=("$ws")
    WS_FILES+=("$f")
  else
    WS_FILES[$idx]="${WS_FILES[$idx]}
$f"
  fi
done <<<"$RAW"

if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "skipped (no workspace eslint.config.mjs):"
  printf '  %s\n' "${SKIPPED[@]}"
fi

if [ ${#WS_LIST[@]} -eq 0 ]; then
  echo "✅ - no changed lintable files"
  exit 0
fi

OUTDIR=$(mktemp -d)
trap 'rm -rf "$OUTDIR"' EXIT

i=0
for ws in "${WS_LIST[@]}"; do
  ws_files=()
  while IFS= read -r f; do ws_files+=("$f"); done <<<"${WS_FILES[$i]}"
  tag=${ws//\//-}
  echo "linting $ws (${#ws_files[@]} file(s))..."
  (
    set +e
    pnpm exec eslint --config "$ws/eslint.config.mjs" --no-warn-ignored \
      ${FIX_ARGS[@]+"${FIX_ARGS[@]}"} "${ws_files[@]}" >"$OUTDIR/$tag.out" 2>&1
    echo $? >"$OUTDIR/$tag.code"
  ) &
  i=$((i + 1))
done

wait

FAILED=0
for ws in "${WS_LIST[@]}"; do
  tag=${ws//\//-}
  cat "$OUTDIR/$tag.out"
  if [ "$(cat "$OUTDIR/$tag.code")" != "0" ]; then
    FAILED=1
  fi
done

if [ "$FAILED" = "1" ]; then
  echo "🛑 - lint failed (file and rule named above); fix or rerun with --fix for autofixable issues"
  exit 1
fi
echo "✅ - lint passed"
