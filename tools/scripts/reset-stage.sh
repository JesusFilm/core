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
      echo "  --no-slack   Skip posting failures to Slack"
      echo "  --help, -h   Show this help"
      exit 0
      ;;
    *)          echo "Unknown flag: $arg (try --help)"; exit 1 ;;
  esac
done

MERGED_PRS=()
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

if [ -n "$(git diff --stat HEAD)" ]; then
  fail "Working tree has uncommitted changes. Commit or stash first."
  exit 1
fi

ORIGINAL_BRANCH=$(git branch --show-current)

log "Fetching origin..."
git fetch origin main --quiet
git fetch origin stage --quiet 2>/dev/null || warn "Remote stage branch not found (may already be deleted)"

# ── Collect PRs ──────────────────────────────────────────────────────

log "Fetching 'on stage' PRs..."
PR_JSON=$(gh api "repos/$REPO/pulls?state=open&labels=on+stage&per_page=100" \
  --jq '.[] | "\(.number)|\(.head.ref)|\(.user.login)|\(.title)"')

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

# ── Branch setup ─────────────────────────────────────────────────────

if $DRY_RUN; then
  log "Creating temporary test branch from origin/main..."
  git checkout -b "$TEMP_BRANCH" origin/main --quiet
else
  echo ""
  read -r -p "This will DELETE and recreate the stage branch. Continue? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[yY]$ ]]; then
    echo "Aborted."
    exit 0
  fi
  echo ""

  log "Deleting remote stage branch..."
  git push -d origin stage 2>/dev/null || warn "Remote stage branch did not exist"

  log "Deleting local stage branch..."
  git branch -D stage 2>/dev/null || true

  log "Creating new stage branch from origin/main..."
  git checkout -b stage origin/main --quiet
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
  else
    CONFLICT_FILES=$(git diff --name-only --diff-filter=U 2>/dev/null | tr '\n' ', ' | sed 's/,$//')
    git merge --abort 2>/dev/null || git reset --hard HEAD --quiet
    fail "  #$PR_NUM CONFLICT: $CONFLICT_FILES"
    FAILED_PRS+=("$PR_NUM|$PR_BRANCH|$PR_AUTHOR|$PR_TITLE")
    FAILED_FILES+=("$CONFLICT_FILES")
  fi
done <<< "$PR_JSON"

# ── Push (real mode only) ────────────────────────────────────────────

if ! $DRY_RUN; then
  log "Pushing stage branch to origin..."
  git push origin stage --quiet
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
FAILED_COUNT=${#FAILED_PRS[@]}
MISSING_COUNT=${#MISSING_PRS[@]}
TOTAL=$((MERGED_COUNT + FAILED_COUNT + MISSING_COUNT))

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

if [ "$FAILED_COUNT" -gt 0 ]; then
  echo "✗ Failed — authors need to rebase against main ($FAILED_COUNT/$TOTAL)"
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
  ok "All $TOTAL PRs merged cleanly!"
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

# ── Slack notification (failures only) ───────────────────────────────

if [ "$FAILED_COUNT" -gt 0 ] && ! $NO_SLACK; then

  SLACK_API="https://slack.com/api/chat.postMessage"

  # Fetch Slack credentials from Doppler
  if ! command -v doppler &>/dev/null; then
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
    SUMMARY_TEXT="If stage were reset now: *${MERGED_COUNT}* PRs would merge  •  *${FAILED_COUNT}* would conflict  •  *${MISSING_COUNT}* branches missing"
    FOOTER_TEXT="This was a dry run — stage has NOT been reset. No action needed yet."
  else
    HEADER_TEXT="Stage Reset Report  —  $(date '+%Y-%m-%d')"
    SUMMARY_TEXT="*${MERGED_COUNT}* PRs merged  •  *${FAILED_COUNT}* PRs failed  •  *${MISSING_COUNT}* branches missing"
    FOOTER_TEXT="Authors: please rebase your branch against \`main\` and re-apply the 'on stage' label."
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
      "elements": [{ "type": "mrkdwn", "text": "${FOOTER_TEXT}  •  See thread for full details." }]
    }
  ]
}
EOF
)

  log "Posting summary to Slack..."
  PARENT_RESPONSE=$(curl -s -X POST "$SLACK_API" \
    -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
    -H 'Content-type: application/json; charset=utf-8' \
    -d "$SUMMARY_PAYLOAD")

  PARENT_OK=$(echo "$PARENT_RESPONSE" | grep -o '"ok":true' || true)
  PARENT_TS=$(echo "$PARENT_RESPONSE" | grep -o '"ts":"[^"]*"' | head -1 | cut -d'"' -f4)

  if [ -z "$PARENT_OK" ]; then
    SLACK_ERROR=$(echo "$PARENT_RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    warn "Slack summary post failed: $SLACK_ERROR"
  elif [ -z "$PARENT_TS" ]; then
    warn "Slack summary posted but could not extract message ts for threading"
  else
    ok "Summary posted"

    # ── Helper: post a threaded reply ──
    post_thread() {
      local TEXT="$1"
      curl -s -X POST "$SLACK_API" \
        -H "Authorization: Bearer $SLACK_BOT_TOKEN" \
        -H 'Content-type: application/json; charset=utf-8' \
        -d "{\"channel\":\"${SLACK_CHANNEL_ID}\",\"thread_ts\":\"${PARENT_TS}\",\"text\":\"${TEXT}\"}"
    }

    # ── Thread reply 1: merged PRs ──

    MERGED_TEXT="*Merged (${MERGED_COUNT}/${TOTAL}):*\n"
    for entry in "${MERGED_PRS[@]}"; do
      PR_NUM=$(echo "$entry" | cut -d'|' -f1)
      PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
      PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
      MERGED_TEXT="${MERGED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE}\n"
    done

    log "Posting merged list in thread..."
    MERGED_RESP=$(post_thread "$MERGED_TEXT")
    MERGED_OK=$(echo "$MERGED_RESP" | grep -o '"ok":true' || true)
    if [ -n "$MERGED_OK" ]; then
      ok "Merged list posted in thread"
    else
      warn "Merged list thread post failed"
    fi

    # ── Thread reply 2: failed PRs (with truncated conflict lists) ──

    FAILED_TEXT="*Failed — need rebase (${FAILED_COUNT}/${TOTAL}):*\n"
    for i in "${!FAILED_PRS[@]}"; do
      entry="${FAILED_PRS[$i]}"
      PR_NUM=$(echo "$entry" | cut -d'|' -f1)
      PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
      PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
      FAILED_TEXT="${FAILED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE}\n"
    done

    if [ "$MISSING_COUNT" -gt 0 ]; then
      FAILED_TEXT="${FAILED_TEXT}\n*Missing branches (${MISSING_COUNT}/${TOTAL}):*\n"
      for entry in "${MISSING_PRS[@]}"; do
        PR_NUM=$(echo "$entry" | cut -d'|' -f1)
        PR_AUTHOR=$(echo "$entry" | cut -d'|' -f3)
        PR_TITLE=$(echo "$entry" | cut -d'|' -f4)
        PR_BRANCH=$(echo "$entry" | cut -d'|' -f2)
        FAILED_TEXT="${FAILED_TEXT}<https://github.com/$REPO/pull/$PR_NUM|#$PR_NUM>  ${PR_AUTHOR} — ${PR_TITLE} (branch: ${PR_BRANCH})\n"
      done
    fi

    log "Posting failed list in thread..."
    FAILED_RESP=$(post_thread "$FAILED_TEXT")
    FAILED_OK=$(echo "$FAILED_RESP" | grep -o '"ok":true' || true)
    if [ -n "$FAILED_OK" ]; then
      ok "Slack notifications sent (summary + 2 threaded replies)"
    else
      warn "Failed list thread post failed"
    fi
  fi
  fi
fi
