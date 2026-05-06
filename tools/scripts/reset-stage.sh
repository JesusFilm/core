#!/bin/bash
set -euo pipefail

REPO="JesusFilm/core"
TEMP_BRANCH="_stage-reset-test"

DRY_RUN=true
NO_SLACK=false

for arg in "$@"; do
  case "$arg" in
    --apply)    DRY_RUN=false ;;
    --no-slack) NO_SLACK=true ;;
    --help|-h)
      echo "Usage: reset-stage.sh [OPTIONS]"
      echo ""
      echo "Resets the stage branch from main and re-merges all 'on stage' PRs."
      echo "Default mode is dry-run (no changes)."
      echo ""
      echo "Options:"
      echo "  --apply      Actually reset and rebuild the stage branch (destructive)"
      echo "  --no-slack   Skip Slack notifications"
      echo "  --help, -h   Show this help"
      exit 0
      ;;
    *)          echo "Unknown flag: $arg (try --help)"; exit 1 ;;
  esac
done

MERGED_PRS=()
AUTORESOLVED_PRS=()
FAILED_PRS=()
FAILED_FILES=()
MISSING_PRS=()

log()  { echo -e "\033[1;34m▸\033[0m $*"; }
ok()   { echo -e "\033[1;32m✓\033[0m $*"; }
fail() { echo -e "\033[1;31m✗\033[0m $*"; }
warn() { echo -e "\033[1;33m!\033[0m $*"; }

# ── Preflight ────────────────────────────────────────────────────────

if ! gh auth status &>/dev/null; then
  fail "gh CLI is not authenticated. Run 'gh auth login' first."
  exit 1
fi

if [ -n "$(git status --porcelain)" ]; then
  fail "Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

ORIGINAL_BRANCH=$(git branch --show-current)

log "Fetching origin..."
git fetch origin main --quiet
git fetch origin stage --quiet 2>/dev/null || warn "Remote stage branch not found (may already be deleted)"

# ── Collect PRs ──────────────────────────────────────────────────────

log "Fetching 'on stage' PRs..."
PR_JSON=$(gh pr list \
  --repo "$REPO" \
  --state open \
  --label "on stage" \
  --limit 100 \
  --json number,headRefName,author,title \
  --jq '.[] | "\(.number)|\(.headRefName)|\(.author.login)|\(.title)"')

if [ -z "$PR_JSON" ]; then
  warn "No open PRs with 'on stage' label found. Nothing to do."
  exit 0
fi

PR_COUNT=$(echo "$PR_JSON" | wc -l | tr -d ' ')
log "Found $PR_COUNT PRs with 'on stage' label"

if $DRY_RUN; then
  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "  DRY RUN — no changes will be made to the stage branch"
  echo "════════════════════════════════════════════════════════════════"
  echo ""
fi

# ── Cleanup trap ─────────────────────────────────────────────────────

cleanup() {
  if $DRY_RUN; then
    git checkout "${ORIGINAL_BRANCH:-main}" --quiet 2>/dev/null || git checkout - --quiet || true
    git branch -D "$TEMP_BRANCH" --quiet 2>/dev/null || true
  else
    git checkout "${ORIGINAL_BRANCH:-main}" --quiet 2>/dev/null || git checkout main --quiet || true
  fi
}

trap cleanup EXIT

# ── Branch setup ─────────────────────────────────────────────────────

if $DRY_RUN; then
  log "Creating temporary test branch from origin/main..."
  git checkout -b "$TEMP_BRANCH" origin/main --quiet
else
  echo ""
  read -r -p "This will reset the stage branch to main and re-merge PRs. Continue? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[yY]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  echo ""

  log "Resetting local stage branch to origin/main..."
  git checkout -B stage origin/main --quiet
fi

# ── Merge loop ───────────────────────────────────────────────────────

while IFS= read -r line; do
  PR_NUM=$(echo "$line" | cut -d'|' -f1)
  PR_BRANCH=$(echo "$line" | cut -d'|' -f2)
  PR_AUTHOR=$(echo "$line" | cut -d'|' -f3)
  PR_TITLE=$(echo "$line" | cut -d'|' -f4)

  log "Merging #$PR_NUM ($PR_BRANCH)..."

  if ! git fetch origin "$PR_BRANCH" --quiet 2>/dev/null; then
    warn "  Branch '$PR_BRANCH' not found on remote — skipping"
    MISSING_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
    continue
  fi

  if git merge "origin/$PR_BRANCH" --no-edit --no-ff --quiet 2>/dev/null; then
    ok "  #$PR_NUM merged"
    MERGED_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
  elif git merge --abort 2>/dev/null && git merge "origin/$PR_BRANCH" --no-edit --no-ff -X theirs --quiet 2>/dev/null; then
    ok "  #$PR_NUM merged (conflicts auto-resolved via -X theirs)"
    AUTORESOLVED_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
  else
    # -X theirs didn't resolve everything (e.g. modify/delete conflicts)
    UNRESOLVED=$(git diff --name-only --diff-filter=U 2>/dev/null || true)
    if [ -n "$UNRESOLVED" ]; then
      while IFS= read -r f; do
        git checkout --theirs -- "$f" 2>/dev/null || git rm -f "$f" 2>/dev/null || true
      done <<< "$UNRESOLVED"
      git add -A
      git -c core.editor=true commit --no-edit --quiet 2>/dev/null || true
      ok "  #$PR_NUM merged (force-resolved remaining conflicts)"
      AUTORESOLVED_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
    else
      git merge --abort 2>/dev/null || git reset --hard HEAD --quiet
      CONFLICT_FILES=$(git diff --name-only --diff-filter=U 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
      fail "  #$PR_NUM FAILED: $CONFLICT_FILES"
      FAILED_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
      FAILED_FILES+=("$CONFLICT_FILES")
    fi
  fi
done <<< "$PR_JSON"

# ── Push (real mode only) ────────────────────────────────────────────

if ! $DRY_RUN; then
  log "Pushing stage branch to origin..."
  git push --force-with-lease origin stage --quiet
  ok "Stage branch pushed"
fi

# ── Cleanup ──────────────────────────────────────────────────────────

if $DRY_RUN; then
  git checkout "$ORIGINAL_BRANCH" --quiet 2>/dev/null || git checkout - --quiet
  git branch -D "$TEMP_BRANCH" --quiet 2>/dev/null || true
else
  git checkout "$ORIGINAL_BRANCH" --quiet 2>/dev/null || git checkout main --quiet
fi

# ── Report ───────────────────────────────────────────────────────────

MERGED_COUNT=${#MERGED_PRS[@]}
AUTORESOLVED_COUNT=${#AUTORESOLVED_PRS[@]}
FAILED_COUNT=${#FAILED_PRS[@]}
MISSING_COUNT=${#MISSING_PRS[@]}
TOTAL=$((MERGED_COUNT + AUTORESOLVED_COUNT + FAILED_COUNT + MISSING_COUNT))
ALL_MERGED=$((MERGED_COUNT + AUTORESOLVED_COUNT))

echo ""
echo "══════════════════════════════════════════════════════════════════════"
if $DRY_RUN; then
  echo "  Stage Reset Report (DRY RUN)  —  $(date '+%Y-%m-%d %H:%M')"
else
  echo "  Stage Reset Report  —  $(date '+%Y-%m-%d %H:%M')"
fi
echo "══════════════════════════════════════════════════════════════════════"
echo ""

if [ "$MERGED_COUNT" -gt 0 ]; then
  echo "✓ Merged ($MERGED_COUNT/$TOTAL)"
  echo "──────────────────────────────────────────────────────────────────"
  for entry in "${MERGED_PRS[@]}"; do
    PR_NUM=$(echo "$entry" | cut -d'|' -f1)
    PR_BRANCH=$(echo "$entry" | cut -d'|' -f2)
    PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
    PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
    printf "  #%-6s %-18s %s\n" "$PR_NUM" "$PR_AUTHOR" "$PR_TITLE"
  done
  echo ""
fi

if [ "$AUTORESOLVED_COUNT" -gt 0 ]; then
  echo "⚡ Auto-resolved conflicts ($AUTORESOLVED_COUNT/$TOTAL)"
  echo "──────────────────────────────────────────────────────────────────"
  for entry in "${AUTORESOLVED_PRS[@]}"; do
    PR_NUM=$(echo "$entry" | cut -d'|' -f1)
    PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
    PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
    printf "  #%-6s %-18s %s\n" "$PR_NUM" "$PR_AUTHOR" "$PR_TITLE"
  done
  echo ""
fi

if [ "$FAILED_COUNT" -gt 0 ]; then
  echo "✗ Failed — could not auto-resolve ($FAILED_COUNT/$TOTAL)"
  echo "──────────────────────────────────────────────────────────────────"
  for i in "${!FAILED_PRS[@]}"; do
    entry="${FAILED_PRS[$i]}"
    conflicts="${FAILED_FILES[$i]}"
    PR_NUM=$(echo "$entry" | cut -d'|' -f1)
    PR_BRANCH=$(echo "$entry" | cut -d'|' -f2)
    PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
    PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
    printf "  #%-6s %-18s %s\n" "$PR_NUM" "$PR_AUTHOR" "$PR_TITLE"
    echo "         Conflicts: $conflicts"
  done
  echo ""
fi

if [ "$MISSING_COUNT" -gt 0 ]; then
  echo "! Missing branch ($MISSING_COUNT/$TOTAL)"
  echo "──────────────────────────────────────────────────────────────────"
  for entry in "${MISSING_PRS[@]}"; do
    PR_NUM=$(echo "$entry" | cut -d'|' -f1)
    PR_BRANCH=$(echo "$entry" | cut -d'|' -f2)
    PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
    PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
    printf "  #%-6s %-18s %s (branch: %s)\n" "$PR_NUM" "$PR_AUTHOR" "$PR_TITLE" "$PR_BRANCH"
  done
  echo ""
fi

if [ "$FAILED_COUNT" -eq 0 ] && [ "$MISSING_COUNT" -eq 0 ]; then
  if [ "$AUTORESOLVED_COUNT" -gt 0 ]; then
    ok "All $TOTAL PRs merged ($AUTORESOLVED_COUNT had conflicts auto-resolved)"
  else
    ok "All $TOTAL PRs merged cleanly!"
  fi
fi

echo "──────────────────────────────────────────────────────────────────"
if $DRY_RUN; then
  echo "  This was a dry run. No changes were made."
  echo ""
  echo "  To perform the actual stage reset:  ./tools/scripts/reset-stage.sh --apply"
  echo "  To skip Slack notification:         ./tools/scripts/reset-stage.sh --apply --no-slack"
else
  echo "  Stage branch has been reset and pushed."
  echo "  Stage deploy workflows will trigger automatically."
fi
echo ""

# ── Slack notification ────────────────────────────────────────────────

if ! $NO_SLACK; then

  SLACK_API="https://slack.com/api/chat.postMessage"

  # Fetch Slack credentials from Doppler
  if ! command -v jq &>/dev/null; then
    warn "jq not installed — skipping Slack notification"
    NO_SLACK=true
  elif ! command -v doppler &>/dev/null; then
    warn "doppler CLI not installed — skipping Slack notification"
    warn "Install: https://docs.doppler.com/docs/install-cli"
  elif ! doppler me &>/dev/null 2>&1; then
    warn "doppler is not authenticated — skipping Slack notification"
    warn "Run 'doppler login' first, then retry"
  else
    SLACK_BOT_TOKEN=$(doppler secrets get STAGE_RESET_SLACK_BOT_TOKEN --plain --project core --config dev 2>/dev/null || true)
    SLACK_CHANNEL_ID=$(doppler secrets get SLACK_ENGINEERING_CHANNEL_ID --plain --project core --config dev 2>/dev/null || true)
  fi

  if [ -z "${SLACK_BOT_TOKEN:-}" ] || [ -z "${SLACK_CHANNEL_ID:-}" ]; then
    warn "STAGE_RESET_SLACK_BOT_TOKEN or SLACK_ENGINEERING_CHANNEL_ID not found in Doppler (core/dev)"
    warn "Add them via: doppler secrets set STAGE_RESET_SLACK_BOT_TOKEN SLACK_ENGINEERING_CHANNEL_ID --project core --config dev"
  else

  if $DRY_RUN; then
    HEADER_TEXT="Stage Reset Preview (no changes made)  —  $(date '+%Y-%m-%d')"
    SUMMARY_TEXT="If stage were reset now: *${MERGED_COUNT}* clean  •  *${AUTORESOLVED_COUNT}* auto-resolved  •  *${FAILED_COUNT}* failed  •  *${MISSING_COUNT}* missing"
    FOOTER_TEXT="This was a dry run — stage has NOT been reset."
  else
    HEADER_TEXT="Stage Reset Complete  —  $(date '+%Y-%m-%d')"
    SUMMARY_TEXT="*${ALL_MERGED}* PRs merged (*${MERGED_COUNT}* clean, *${AUTORESOLVED_COUNT}* auto-resolved)  •  *${FAILED_COUNT}* failed  •  *${MISSING_COUNT}* missing"
    if [ "$FAILED_COUNT" -gt 0 ]; then
      FOOTER_TEXT="*${FAILED_COUNT}* PR(s) could not be auto-resolved — authors should investigate."
    else
      FOOTER_TEXT="All PRs merged successfully. Stage deploy will trigger automatically."
    fi
  fi

  # ── Post 1: top-level summary ──

  SUMMARY_PAYLOAD=$(cat <<EOF
{
  "channel": "${SLACK_CHANNEL_ID}",
  "blocks": [
    {
      "type": "header",
      "text": { "type": "plain_text", "text": "${HEADER_TEXT}" }
    },
    {
      "type": "section",
      "text": { "type": "mrkdwn", "text": "${SUMMARY_TEXT}" }
    },
    {
      "type": "context",
      "elements": [{ "type": "mrkdwn", "text": "${FOOTER_TEXT}  •  See thread for details." }]
    }
  ]
}
EOF
)

  log "Posting summary to Slack..."
  PARENT_RESPONSE=$(curl -s --connect-timeout 10 --max-time 30 -X POST "$SLACK_API" \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H 'Content-type: application/json; charset=utf-8' \
    -d "$SUMMARY_PAYLOAD")

  PARENT_OK=""
  PARENT_TS=""
  if echo "$PARENT_RESPONSE" | grep -q '"ok":true'; then
    PARENT_OK="true"
    PARENT_TS=$(echo "$PARENT_RESPONSE" | grep -o '"ts":"[^"]*"' | head -1 | cut -d'"' -f4 || true)
  fi

  if [ -z "$PARENT_OK" ]; then
    SLACK_ERROR=$(echo "$PARENT_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4 || true)
    warn "Slack summary post failed: $SLACK_ERROR"
  elif [ -z "$PARENT_TS" ]; then
    warn "Slack summary posted but could not extract message ts for threading"
  else
    ok "Summary posted"

    # ── Helper: post a threaded reply ──
    post_thread() {
      local TEXT="$1"
      local payload
      payload=$(jq -n \
        --arg channel "$SLACK_CHANNEL_ID" \
        --arg thread_ts "$PARENT_TS" \
        --arg text "$TEXT" \
        '{channel: $channel, thread_ts: $thread_ts, text: $text}')
      curl -s --connect-timeout 10 --max-time 30 -X POST "$SLACK_API" \
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
        -H 'Content-type: application/json; charset=utf-8' \
        -d "$payload"
    }

    # ── Thread reply 1: merged PRs (clean + auto-resolved) ──

    NL=$'\n'
    MERGED_TEXT="*Clean merges (${MERGED_COUNT}):*${NL}"
    for entry in "${MERGED_PRS[@]}"; do
      PR_NUM=$(echo "$entry" | cut -d'|' -f1)
      PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
      PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
      MERGED_TEXT="${MERGED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE}${NL}"
    done

    if [ "$AUTORESOLVED_COUNT" -gt 0 ]; then
      MERGED_TEXT="${MERGED_TEXT}${NL}*Auto-resolved (${AUTORESOLVED_COUNT}):*${NL}"
      for entry in "${AUTORESOLVED_PRS[@]}"; do
        PR_NUM=$(echo "$entry" | cut -d'|' -f1)
        PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
        PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
        MERGED_TEXT="${MERGED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE}${NL}"
      done
    fi

    log "Posting merged list in thread..."
    MERGED_RESP=$(post_thread "$MERGED_TEXT")
    if echo "$MERGED_RESP" | grep -q '"ok":true'; then
      ok "Merged list posted in thread"
    else
      warn "Merged list thread post failed"
    fi

    # ── Thread reply 2: failed + missing PRs (only if any) ──

    if [ "$FAILED_COUNT" -gt 0 ] || [ "$MISSING_COUNT" -gt 0 ]; then
      FAILED_TEXT=""

      if [ "$FAILED_COUNT" -gt 0 ]; then
        FAILED_TEXT="*Failed — could not auto-resolve (${FAILED_COUNT}):*${NL}"
        for i in "${!FAILED_PRS[@]}"; do
          entry="${FAILED_PRS[$i]}"
          PR_NUM=$(echo "$entry" | cut -d'|' -f1)
          PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
          PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
          FAILED_TEXT="${FAILED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE}${NL}"
        done
      fi

      if [ "$MISSING_COUNT" -gt 0 ]; then
        FAILED_TEXT="${FAILED_TEXT}${NL}*Missing branches (${MISSING_COUNT}):*${NL}"
        for entry in "${MISSING_PRS[@]}"; do
          PR_NUM=$(echo "$entry" | cut -d'|' -f1)
          PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
          PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
          PR_BRANCH=$(echo "$entry" | cut -d'|' -f2)
          FAILED_TEXT="${FAILED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE} (branch: ${PR_BRANCH})${NL}"
        done
      fi

      log "Posting failed list in thread..."
      FAILED_RESP=$(post_thread "$FAILED_TEXT")
      if echo "$FAILED_RESP" | grep -q '"ok":true'; then
        ok "Slack notifications sent (summary + 2 threaded replies)"
      else
        warn "Failed list thread post failed"
      fi
    else
      ok "Slack notification sent (summary + merged list)"
    fi
  fi
  fi
fi
