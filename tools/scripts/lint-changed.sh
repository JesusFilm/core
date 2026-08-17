#!/bin/bash

# Lint only changed files (full `nx lint` is far too slow for commit-time feedback).
# Mirrors the autofix.ci steps that can write a file, in the same order, so a
# clean run here means autofix.ci has nothing left to commit:
#
#   1. Prettier   — formatting, across every changed file of any type.
#   2. ESLint     — code rules, across changed JS/TS only.
#   3. i18next    — extracted translations, for changed projects only.
#
# Deliberately not mirrored, because none of them can produce a commit:
# type-check and subgraph-check only report (and subgraph-check needs a Hive
# token); prisma-generate writes nothing that is tracked. codegen is the one
# real gap — it can commit, but it `rm -rf`s a project's whole __generated__
# directory before regenerating from a deprecated global apollo CLI, which is
# not something a push hook should do to a working tree. It stays with CI.
#
# All three passes are needed. ESLint cannot report a formatting problem: the repo
# uses eslint-config-prettier, which exists to switch every formatting rule off,
# and there is no eslint-plugin-prettier anywhere. Formatting is Prettier's job
# alone, and Prettier also covers the file types ESLint never sees (.md, .json,
# .yaml, .css, .graphql). Running ESLint on its own is why autofix.ci kept
# committing "fix: lint issues" on PRs that had passed this gate.
#
# ESLint groups files by their nearest eslint.config.mjs and runs once per
# workspace from the repo root with --config, which is how flat-config path
# patterns like 'apps/journeys-admin/**' resolve correctly (with --config the
# pattern base is the cwd). Workspaces are linted in parallel (capped at
# LINT_CHANGED_JOBS, default 4 — each run builds its own TypeScript program).
#
# Usage:
#   tools/scripts/lint-changed.sh              # all changes vs merge-base with origin/main (incl. uncommitted + untracked)
#   tools/scripts/lint-changed.sh --committed  # committed changes vs origin/main (refreshed first)
#   tools/scripts/lint-changed.sh --staged     # staged files only (lints their working-tree contents)
#   tools/scripts/lint-changed.sh --fix        # apply the fixes to the working tree (commit them yourself)
#
# Note --fix runs i18next extraction project-wide, not per-file, so it can pull
# in a t() string someone else left unextracted in the same project. That is
# intended: it is what autofix.ci would have committed anyway.
#
# There is no git hook on this. Agents run it themselves before pushing (see
# "Lint before push" in AGENTS.md) — a hook cannot work here, because git
# resolves which commits to push before hooks run, so fixes a hook commits are
# left behind and never reach the remote. Humans are not gated.
#
# Prettier costs well under a second, and i18next extraction roughly 2-3s per
# touched project. ESLint costs roughly 5-20s per touched workspace: type-aware
# lint rules build a TypeScript program per workspace on every run.

set -euo pipefail

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

# Resolve the toolchain ourselves rather than via `pnpm exec`. A checkout made
# with `git worktree add` has no node_modules of its own, and pnpm treats each
# worktree as its own root (it has its own pnpm-workspace.yaml), so `pnpm exec`
# there fails with ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL rather than falling back.
# git points us at the main checkout via --git-common-dir; its node_modules is
# the same dependency set, so running those binaries against worktree paths is
# correct (Prettier and ESLint both resolve their config from the target file,
# and the worktree has its own copies).
resolve_bin_dir() {
  if [ -d "$REPO_ROOT/node_modules/.bin" ]; then
    BIN_DIR="$REPO_ROOT/node_modules/.bin"
    return 0
  fi
  local common
  if ! common=$(git rev-parse --git-common-dir 2>/dev/null); then
    return 1
  fi
  case "$common" in
    /*) ;;
    *) common="$REPO_ROOT/$common" ;;
  esac
  MAIN_ROOT=$(dirname "$common")
  if [ -d "$MAIN_ROOT/node_modules/.bin" ]; then
    # Borrowing the binaries only works if node can also reach the main
    # checkout's node_modules when it resolves what the *configs* import
    # (.prettierrc's prettier-plugin-tailwindcss, eslint plugins, i18next's
    # glob). Node resolves those by walking up from the worktree, so it only
    # reaches MAIN_ROOT if the worktree sits inside it. A sibling worktree
    # (git worktree add ../core-feature) resolves nothing, and the tools then
    # exit non-zero in a way that is indistinguishable from a real lint
    # failure — so refuse up front instead.
    case "$REPO_ROOT/" in
      "$MAIN_ROOT"/*) ;;
      *)
        echo "🛑 - this worktree is not inside the main checkout, so tool plugins cannot resolve" >&2
        echo "    worktree:      $REPO_ROOT" >&2
        echo "    main checkout: $MAIN_ROOT" >&2
        echo "    create worktrees under the main checkout (.claude/worktrees/<branch>)," >&2
        echo "    or run \`pnpm install\` here to give this checkout its own node_modules" >&2
        # exit rather than return: the caller's "could not find node_modules/.bin"
        # would be wrong here — we found it, it just isn't reachable from this path
        exit 1
        ;;
    esac
    BIN_DIR="$MAIN_ROOT/node_modules/.bin"
    echo "note: using the main checkout's toolchain ($MAIN_ROOT/node_modules)"
    return 0
  fi
  return 1
}

if ! resolve_bin_dir; then
  echo "🛑 - could not find node_modules/.bin" >&2
  echo "    run \`pnpm install\` in the main checkout" >&2
  exit 1
fi

# A partial install (--prod, a pruned image) leaves .bin present but missing
# these. Without this check the invocation exits 127 and gets folded into
# "formatting issues" or "translations are out of date" — an install problem
# wearing the mask of a content problem.
for required_bin in prettier eslint i18next-cli; do
  if [ ! -x "$BIN_DIR/$required_bin" ]; then
    echo "🛑 - $required_bin missing from $BIN_DIR" >&2
    echo "    run \`pnpm install\`" >&2
    exit 1
  fi
done

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

# ---------------------------------------------------------------------------
# Pass 1: Prettier (formatting) — every changed file, not just JS/TS.
# ---------------------------------------------------------------------------
# .prettierignore is honoured for explicitly-passed paths, so the carve-outs it
# already declares (.claude/skills, .agents/skills, libs/locales, generated
# files) apply here for free — no filtering needed on our side.
PRETTIER_FILES=()
while IFS= read -r f; do
  if [ -z "$f" ]; then continue; fi
  if [ ! -f "$f" ]; then continue; fi
  PRETTIER_FILES+=("$f")
done <<<"$RAW"

PRETTIER_FAILED=0
if [ ${#PRETTIER_FILES[@]} -eq 0 ]; then
  echo "no changed files to format-check"
else
  if [ ${#FIX_ARGS[@]} -gt 0 ]; then
    PRETTIER_MODE=--write
  else
    PRETTIER_MODE=--check
  fi
  echo "prettier ${PRETTIER_MODE#--} on ${#PRETTIER_FILES[@]} file(s)..."
  # --ignore-unknown: a changed file with no inferable parser (Dockerfile,
  # LICENSE, .env.example) otherwise exits 2 and would fail the whole push.
  if ! "$BIN_DIR/prettier" "$PRETTIER_MODE" --ignore-unknown "${PRETTIER_FILES[@]}"; then
    PRETTIER_FAILED=1
  fi
fi

# ---------------------------------------------------------------------------
# Pass 2: ESLint (code rules) — changed JS/TS grouped by workspace.
# ---------------------------------------------------------------------------
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
  echo "eslint skipped (no workspace eslint.config.mjs); still format-checked:"
  printf '  %s\n' "${SKIPPED[@]}"
fi

OUTDIR=$(mktemp -d)
trap 'rm -rf "$OUTDIR"' EXIT

if [ ${#WS_LIST[@]} -eq 0 ]; then
  echo "no changed JS/TS for eslint"
fi

i=0
for ws in ${WS_LIST[@]+"${WS_LIST[@]}"}; do
  ws_files=()
  while IFS= read -r f; do ws_files+=("$f"); done <<<"${WS_FILES[$i]}"
  tag="$i-${ws//\//-}"
  echo "linting $ws (${#ws_files[@]} file(s))..."
  while [ "$(jobs -rp | wc -l)" -ge "$MAX_JOBS" ]; do sleep 0.2; done
  (
    set +e
    "$BIN_DIR/eslint" --config "$ws/eslint.config.mjs" --no-warn-ignored \
      ${FIX_ARGS[@]+"${FIX_ARGS[@]}"} "${ws_files[@]}" \
      >"$OUTDIR/$tag.out" 2>&1
    echo $? >"$OUTDIR/$tag.code"
  ) &
  i=$((i + 1))
done

wait

FAILED=0
i=0
for ws in ${WS_LIST[@]+"${WS_LIST[@]}"}; do
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

# ---------------------------------------------------------------------------
# Pass 3: i18next extraction (translations) — changed projects only.
# ---------------------------------------------------------------------------
# autofix.ci runs `extract-translations` and commits whatever it writes, so a
# new t() string that was never extracted arrives as a bot commit on the PR.
# The extractor reads only js/jsx/ts/tsx, so reuse the file list ESLint built
# its groups from, regrouped by nearest i18next.config.js.
#
# --dry-run --ci reports drift by exit code without touching the working tree;
# under --fix we let it write, exactly as the bot would.
I18N_LIST=()
while IFS= read -r f; do
  if [ -z "$f" ]; then continue; fi
  case "$f" in
    *.ts | *.tsx | *.js | *.jsx) ;;
    *) continue ;;
  esac
  if [ ! -f "$f" ]; then continue; fi
  d=$(dirname "$f")
  cfg=""
  while [ "$d" != "." ] && [ "$d" != "/" ]; do
    if [ -f "$d/i18next.config.js" ]; then
      cfg="$d/i18next.config.js"
      break
    fi
    d=$(dirname "$d")
  done
  if [ -z "$cfg" ]; then continue; fi
  seen=0
  for existing in ${I18N_LIST[@]+"${I18N_LIST[@]}"}; do
    if [ "$existing" = "$cfg" ]; then
      seen=1
      break
    fi
  done
  if [ "$seen" -eq 0 ]; then I18N_LIST+=("$cfg"); fi
done <<<"$RAW"

I18N_FAILED=0
if [ ${#I18N_LIST[@]} -eq 0 ]; then
  echo "no changed files in a project with translations"
else
  I18N_ARGS=(--quiet)
  if [ ${#FIX_ARGS[@]} -eq 0 ]; then
    I18N_ARGS+=(--dry-run --ci)
  fi
  for cfg in "${I18N_LIST[@]}"; do
    echo "extracting translations for $(dirname "$cfg")..."
    if ! "$BIN_DIR/i18next-cli" extract --config "$cfg" "${I18N_ARGS[@]}"; then
      I18N_FAILED=1
      echo "  ^ translations are stale for $(dirname "$cfg")"
    fi
  done
fi

if [ "$FAILED" = "1" ] || [ "$PRETTIER_FAILED" = "1" ] || [ "$I18N_FAILED" = "1" ]; then
  if [ "$PRETTIER_FAILED" = "1" ]; then
    echo "🛑 - formatting issues (prettier, files named above)"
  fi
  if [ "$FAILED" = "1" ]; then
    echo "🛑 - lint failed (file and rule named above)"
  fi
  if [ "$I18N_FAILED" = "1" ]; then
    echo "🛑 - extracted translations are out of date (projects named above)"
  fi
  echo "    fix, or rerun with --fix for autofixable issues"
  exit 1
fi
echo "✅ - format, lint and translations passed"
