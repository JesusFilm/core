---
name: reset-stage
description: >-
  Reset the stage branch from main and re-merge all "on stage" PRs.
  Auto-resolves merge conflicts by accepting incoming changes (-X theirs).
  Reports results to Slack with threaded details.
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
   - The Slack channel has been notified with a full breakdown
   - Any truly unresolvable PRs (very rare) need their authors to investigate

## Trigger phrases

- "reset stage"
- "rebuild stage"
- "stage is broken"
- "what if stage reset"
- "dry run stage"

## How conflict resolution works

### The problem

Resetting stage from `main` and re-merging all "on stage" PRs used to
replay the exact same conflicts that caused the reset in the first place.
The reset didn't actually get you unstuck.

### The solution: accept incoming changes (`-X theirs`)

The script uses a two-phase merge for each PR:

1. **Try a clean merge** — `git merge origin/<branch> --no-ff`
2. **If that conflicts** — abort, retry with `git merge -X theirs`
3. **If -X theirs still fails** (rare; e.g. modify/delete conflicts) —
   force-resolve remaining files by checking out the PR's version

`-X theirs` tells Git to resolve conflicted hunks by taking the incoming
(PR branch) side. Non-conflicting changes from both sides are still merged
normally via 3-way merge — it only overrides the conflicted parts.

### Why this is safe

- **Stage is ephemeral.** It exists purely for integration testing and gets
  force-pushed on every reset. Nobody branches off it.
- **PR branches are the source of truth.** Each feature branch goes through
  proper code review before merging to `main`. Stage is just a preview.
- **Worst case is a broken stage build.** Which is the same outcome as a bad
  manual conflict resolution — and the fix is to run the reset again.
- **The PR branch is never modified.** Only the stage branch is affected.

### Merge order

PRs are merged newest-first (highest PR number). When two PRs modify the
same lines, the one merged second "wins" for those hunks. This is
deterministic — same PR set + same order = same result.

### Report categories

| Category        | Meaning                                                |
|-----------------|--------------------------------------------------------|
| Clean merge     | No conflicts at all                                    |
| Auto-resolved   | Had conflicts, resolved automatically via `-X theirs`  |
| Failed          | Could not be resolved even with force (very rare)      |
| Missing branch  | Remote branch no longer exists                         |

## Recovery

### If stage is broken after a reset

Run the reset again. The script deletes the remote stage branch and
recreates it from `main`, so every reset starts completely fresh.

### If an engineer's PR is causing problems on stage

1. The engineer's **PR branch is never touched** — only stage is affected.
2. The engineer rebases their branch against `main` and pushes.
3. The next stage reset picks up the fixed version automatically.
4. No manual merge conflict resolution is ever needed on the stage branch.

### If you need to exclude a specific PR

Remove the "on stage" label from that PR before running the reset.
The script only merges PRs that currently have the label.

## Prerequisites

- `gh` CLI must be authenticated (`gh auth login`)
- Doppler must be authenticated for Slack notifications (`doppler login`)
  - Secrets: `STAGE_RESET_SLACK_BOT_TOKEN`, `SLACK_ENGINEERING_CHANNEL_ID`
  - Location: Doppler project `core`, config `dev`
- If Doppler is not authenticated, the script runs but skips Slack
- A confirmation prompt prevents accidental real resets (`--apply`)
