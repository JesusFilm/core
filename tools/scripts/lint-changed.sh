#!/bin/bash

# Lint only changed files (full `nx lint` is far too slow for commit-time feedback).
# Groups files by their nearest eslint.config.mjs and runs ESLint once per
# workspace from the repo root with --config, which is how flat-config path
# patterns like 'apps/journeys-admin/**' resolve correctly (with --config the
# pattern base is the cwd). Workspaces are linted in parallel (capped at
# LINT_CHANGED_JOBS, default 4 — each run builds its own TypeScript program).
#
# Usage:
#   tools/scripts/lint-changed.sh              # all changes vs merge-base with origin/main (incl. uncommitted + untracked)
#   tools/scripts/lint-changed.sh --committed  # committed changes vs origin/main (refreshed first); what the pre-push gate lints
#   tools/scripts/lint-changed.sh --staged     # staged files only (lints their working-tree contents)
#   tools/scripts/lint-changed.sh --fix        # apply autofixes to the working tree (re-stage/re-commit them yourself)
#
# Expect roughly 5-20s per touched workspace: type-aware lint rules build a
# TypeScript program per workspace on every run. That is why the only hook on
# this is the agent-gated pre-push (.husky/pre-push), not a per-commit hook.

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

MODE=all
FIX_ARGS=()
for arg in "$@"; do
  case "$arg" in
    --staged | --committed)
      new_mode="${arg#--}"
      if [ "$MODE" != "all" ] && [ "$MODE" != "$new_mode" ]; then
        echo "conflicting options: --$MODE and $arg" >&2
        exit 2
      fi
      MODE="$new_mode"
      ;;
    --fix) FIX_ARGS=(--fix) ;;
    *)
      echo "unknown option: $arg" >&2
      echo "usage: tools/scripts/lint-changed.sh [--staged|--committed] [--fix]" >&2
      exit 2
      ;;
  esac
done

MAX_JOBS=${LINT_CHANGED_JOBS:-4}
if ! [ "$MAX_JOBS" -gt 0 ] 2>/dev/null; then
  echo "LINT_CHANGED_JOBS must be a positive integer (got '$MAX_JOBS')" >&2
  exit 2
fi

diff_names() {
  git diff --name-only --diff-filter=ACMR "$@"
}

resolve_base() {
  if [ "$MODE" = "committed" ]; then
    # refresh the ref the gate lints against; tolerate being offline (an
    # offline push would fail moments later anyway)
    git fetch origin main --quiet 2>/dev/null || true
  fi
  if ! BASE=$(git merge-base HEAD origin/main 2>/dev/null); then
    echo "🛑 - could not resolve merge-base with origin/main" >&2
    echo "    run \`git fetch origin main\` and check that the 'origin' remote exists" >&2
    exit 1
  fi
}

if [ "$MODE" = "staged" ]; then
  RAW=$(diff_names --cached)
elif [ "$MODE" = "committed" ]; then
  resolve_base
  RAW=$(diff_names "$BASE" HEAD)
else
  resolve_base
  RAW=$(
    {
      diff_names "$BASE"
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
  tag="$i-${ws//\//-}"
  echo "linting $ws (${#ws_files[@]} file(s))..."
  while [ "$(jobs -rp | wc -l)" -ge "$MAX_JOBS" ]; do sleep 0.2; done
  (
    set +e
    pnpm exec eslint --config "$ws/eslint.config.mjs" --no-warn-ignored \
      ${FIX_ARGS[@]+"${FIX_ARGS[@]}"} "${ws_files[@]}" \
      >"$OUTDIR/$tag.out" 2>&1
    echo $? >"$OUTDIR/$tag.code"
  ) &
  i=$((i + 1))
done

wait

FAILED=0
i=0
for ws in "${WS_LIST[@]}"; do
  tag="$i-${ws//\//-}"
  if [ -f "$OUTDIR/$tag.out" ]; then
    cat "$OUTDIR/$tag.out"
  fi
  code=$(cat "$OUTDIR/$tag.code" 2>/dev/null || echo missing)
  if [ "$code" != "0" ]; then
    FAILED=1
    if [ "$code" = "missing" ]; then
      echo "🛑 - lint worker for $ws produced no result (killed?); treating as failure"
    fi
  fi
  i=$((i + 1))
done

if [ "$FAILED" = "1" ]; then
  echo "🛑 - lint failed (file and rule named above); fix or rerun with --fix for autofixable issues"
  exit 1
fi
echo "✅ - lint passed"
