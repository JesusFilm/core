#!/bin/bash

# Lint only changed files (full `nx lint` is far too slow for commit-time feedback).
# Groups files by their nearest eslint.config.mjs and runs ESLint once per
# workspace from the repo root with --config, which is how flat-config path
# patterns like 'apps/journeys-admin/**' resolve correctly (with --config the
# pattern base is the cwd). Workspaces are linted in parallel.
#
# Usage:
#   tools/scripts/lint-changed.sh              # all changes vs merge-base with origin/main (incl. uncommitted + untracked)
#   tools/scripts/lint-changed.sh --committed  # committed changes only (what a push would send)
#   tools/scripts/lint-changed.sh --staged     # staged files only (lints their working-tree contents)
#   tools/scripts/lint-changed.sh --fix        # apply autofixes
#
# Expect roughly 5-20s per touched workspace: type-aware lint rules build a
# TypeScript program per workspace on every run. That is why the only hook on
# this is the agent-gated pre-push (.husky/pre-push), not a per-commit hook.

set -u

cd "$(git rev-parse --show-toplevel)" || exit 1

MODE=all
FIX=""
for arg in "$@"; do
  case "$arg" in
    --staged) MODE=staged ;;
    --committed) MODE=committed ;;
    --fix) FIX="--fix" ;;
    *)
      echo "unknown option: $arg" >&2
      echo "usage: tools/scripts/lint-changed.sh [--staged|--committed] [--fix]" >&2
      exit 2
      ;;
  esac
done

if [ "$MODE" = "staged" ]; then
  FILES=$(git diff --name-only --cached --diff-filter=ACMR)
elif [ "$MODE" = "committed" ]; then
  BASE=$(git merge-base HEAD origin/main) || exit 1
  FILES=$(git diff --name-only --diff-filter=ACMR "$BASE" HEAD)
else
  BASE=$(git merge-base HEAD origin/main) || exit 1
  FILES=$(
    (
      git diff --name-only --diff-filter=ACMR "$BASE"
      git ls-files --others --exclude-standard
    ) | sort -u
  )
fi

LINTABLE=""
SKIPPED=""
for f in $FILES; do
  case "$f" in
    *.ts | *.tsx | *.js | *.jsx | *.cjs | *.mjs) ;;
    *) continue ;;
  esac
  [ -f "$f" ] || continue
  # find the nearest workspace eslint config above the file
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
    SKIPPED="$SKIPPED $f"
    continue
  fi
  LINTABLE="$LINTABLE$ws|$f
"
done

if [ -n "$SKIPPED" ]; then
  echo "skipped (no workspace eslint.config.mjs):"
  for f in $SKIPPED; do echo "  $f"; done
fi

WORKSPACES=$(printf '%s' "$LINTABLE" | cut -d'|' -f1 | sort -u)
if [ -z "$WORKSPACES" ]; then
  echo "✅ - no changed lintable files"
  exit 0
fi

OUTDIR=$(mktemp -d)
trap 'rm -rf "$OUTDIR"' EXIT

i=0
PIDS=""
for ws in $WORKSPACES; do
  i=$((i + 1))
  ws_files=$(printf '%s' "$LINTABLE" | grep "^$ws|" | cut -d'|' -f2-)
  echo "linting $ws ($(echo "$ws_files" | wc -l | tr -d ' ') file(s))..."
  (
    # shellcheck disable=SC2086 # ws_files is a list of paths without spaces
    pnpm exec eslint --config "$ws/eslint.config.mjs" --no-warn-ignored $FIX $ws_files \
      >"$OUTDIR/$i.out" 2>&1
    echo $? >"$OUTDIR/$i.code"
  ) &
  PIDS="$PIDS $!"
done

wait $PIDS

FAILED=0
for out in "$OUTDIR"/*.out; do
  cat "$out"
  code=$(cat "${out%.out}.code")
  [ "$code" = "0" ] || FAILED=1
done

if [ "$FAILED" = "1" ]; then
  echo "🛑 - lint failed (file and rule named above); fix or rerun with --fix for autofixable issues"
  exit 1
fi
echo "✅ - lint passed"
