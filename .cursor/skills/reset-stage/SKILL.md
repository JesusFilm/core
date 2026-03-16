---
name: reset-stage
description: >-
  Reset the stage branch from main and re-merge all "on stage" PRs.
  Reports merged/failed PRs and posts failures to Slack.
  Use when stage has conflicts, drift, or needs a clean rebuild.
---

# Reset Stage

Automates the stage branch reset process documented in
`apps/docs/docs/04-engineering-practices/02-deployment/index.md`.

## When to use

- User says "reset stage", "rebuild stage", "stage is broken"
- User says "what if stage reset" or "dry run stage"
- Stage branch has conflicts preventing new PR merges
- Stage has drifted from main due to closed/stale PRs

## Steps

1. Ensure the working tree is clean. If dirty, ask the user to stash or commit.

2. Run the script. Default is dry-run (safe, no changes):

   ```bash
   # Dry run — default, safe, no changes
   ./tools/scripts/reset-stage.sh

   # Actual reset (destructive, prompts for confirmation)
   ./tools/scripts/reset-stage.sh --apply

   # Actual reset, skip Slack notification
   ./tools/scripts/reset-stage.sh --apply --no-slack
   ```

3. Show the full output to the user.

4. If `--apply` was used, remind the user:
   - Stage deploy workflows will trigger automatically on push
   - PRs that failed need their authors to rebase against `main`
   - The Slack channel has been notified of any failures

## Trigger phrases

- "reset stage"
- "rebuild stage"
- "stage is broken"
- "what if stage reset"
- "dry run stage"

## Notes

- The script requires `gh` CLI to be authenticated
- Slack credentials (`SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`) are fetched from Doppler (`core/dev`)
- If Doppler is not authenticated, the script skips Slack and warns the user to run `doppler login`
- Slack notifications only fire when there are failed PRs
- A confirmation prompt prevents accidental real resets
