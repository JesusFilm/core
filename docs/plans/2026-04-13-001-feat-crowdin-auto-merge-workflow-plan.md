---
title: 'feat: Auto-approve and auto-merge weekly Crowdin translation PR'
type: feat
status: active
date: 2026-04-13
linear: ENG-3672
---

# feat: Auto-approve and auto-merge weekly Crowdin translation PR

## Overview

Add a GitHub Actions workflow that automatically approves and merges the weekly Crowdin translation PR (`chore: new crowdin translations`) on a cron schedule. This eliminates the manual weekly merge task currently performed by team members.

## Problem Frame

The Crowdin SaaS integration creates a PR on branch `00-00-CI-chore-i10n-updates` whenever translations are synced. A team member must manually check out the PR, assign themselves, request a review, and merge it — roughly weekly. This is low-value toil that can be safely automated since translation PRs only touch locale JSON files in `libs/locales/`.

The current open Crowdin PR (#8888) has been blocked for 24+ days because the Danger check requires an assignee and reviewer, illustrating the friction.

## Requirements Trace

- R1. Workflow merges the open Crowdin translation PR weekly on a cron schedule
- R2. Only merges PRs that exclusively modify files in `libs/locales/`
- R3. Satisfies existing Danger check requirements (assignee + reviewer/approval)
- R4. Exits gracefully when no Crowdin PR is open
- R5. Supports manual trigger via `workflow_dispatch`

## Scope Boundaries

- This workflow does NOT replace the Crowdin SaaS integration that creates the PR
- This workflow does NOT modify the `dangerfile.ts` — it satisfies existing checks programmatically
- Translation quality review (ENG-3565) is a separate concern — when that work lands, it can be integrated as a pre-merge gate

## Context & Research

### Relevant Code and Patterns

- `crowdin.yml` (root) — Crowdin SaaS config: PR title `chore: new crowdin translations`, branch `00-00-CI-chore-i10n-updates`, assignee `crowdin-bot`
- `.github/workflows/crowdin.yml` — existing Crowdin download workflow (does not create PRs, `create_pull_request: false`)
- `.github/workflows/ai-build-spike.yml` (lines 41-46) — established pattern for generating a CI Bot GitHub App token via `actions/create-github-app-token@v1` with `CI_BOT_APP_ID` / `CI_BOT_PRIVATE_KEY`
- `.github/workflows/housekeeping-cron.yml` — cron + `workflow_dispatch` pattern with Blacksmith runners
- `dangerfile.ts` (lines 51-74) — enforces assignee (line 51-53) and reviewer/review (lines 68-74) on all PRs
- `.github/merge-bot.yml` — existing merge bot for `stage` branch only, not applicable here

### Institutional Learnings

No prior documented solutions for CI/CD automation or Crowdin workflow improvements.

### External References

- [GitHub: Enabling auto-merge](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/automatically-merging-a-pull-request) — auto-merge must be enabled in repo settings
- [GitHub App tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-a-user-access-token-for-a-github-app) — App tokens can approve PRs they didn't create

## Key Technical Decisions

- **Use CI Bot App token (not `GITHUB_TOKEN`) for approval**: `GITHUB_TOKEN` cannot approve PRs from workflows it triggers. The CI Bot App is an established pattern in this repo (`ai-build-spike.yml`) and its token can submit approval reviews.
- **Separate workflow file**: Keep the auto-merge concern separate from the existing `crowdin.yml` sync workflow. Different triggers, different responsibilities.
- **File-path safety guard**: Before approving, verify that all changed files are under `libs/locales/`. This prevents auto-merging if someone pushes non-translation changes to the Crowdin branch.
- **Use `gh pr merge --auto --squash`**: This enqueues the PR into the existing merge queue rather than bypassing branch protection. All required status checks still run.
- **Weekly Monday 9am UTC schedule**: Aligns with the existing weekly Crowdin merge cadence. `workflow_dispatch` provides a manual fallback.

## Open Questions

### Resolved During Planning

- **Q: How to satisfy Danger's assignee + reviewer checks?** Use the CI Bot App token to (1) assign the PR and (2) submit an approval review. The Danger check only requires `assignee !== null` and `reviews.data.length > 0`.
- **Q: Will the merge queue still run all checks?** Yes. `gh pr merge --auto --squash` enqueues the PR; the merge queue runs `main.yml`, `autofix.ci.yml`, `app-deploy.yml`, etc. before merging.
- **Q: What if the Crowdin PR has merge conflicts?** Auto-merge will fail, and the PR stays open. This is the correct behavior — conflicts require manual resolution.

### Deferred to Implementation

- **Q: Exact `gh` CLI commands for PR discovery and file validation** — will be determined by what the `gh` CLI supports for filtering PRs and listing changed files.

## Implementation Units

- [x] **Unit 1: Create the crowdin-auto-merge workflow file**

**Goal:** Add a new GitHub Actions workflow that finds the open Crowdin PR, validates it only touches locale files, approves it, and enables auto-merge.

**Requirements:** R1, R2, R3, R4, R5

**Dependencies:** None — this is the only implementation unit.

**Files:**

- Create: `.github/workflows/crowdin-auto-merge.yml`

**Approach:**

- Trigger on `schedule` (weekly Monday 9am UTC: `cron: '0 9 * * 1'`) and `workflow_dispatch`
- Set `permissions: contents: write, pull-requests: write`
- Use `actions/create-github-app-token@v1` with `CI_BOT_APP_ID` / `CI_BOT_PRIVATE_KEY` (mirror `ai-build-spike.yml` pattern)
- Find the open PR using `gh pr list` filtering by head branch `00-00-CI-chore-i10n-updates` and state `open`
- If no PR found, exit gracefully with a logged message
- Validate changed files using `gh pr diff` or `gh api` — check that every changed file path starts with `libs/locales/`
- If non-locale files are found, exit with an error message (do not merge)
- Assign the PR (using `gh pr edit --add-assignee`) to satisfy Danger's assignee check
- Submit an approval review using the CI Bot App token via `gh pr review --approve`
- Enable auto-merge: `gh pr merge --auto --squash`
- Use `blacksmith-2vcpu-ubuntu-2204` runner (lightweight job, follows repo convention)
- Include `concurrency` group to prevent parallel runs
- Set `GH_TOKEN` to the CI Bot App token for all `gh` commands

**Patterns to follow:**

- `.github/workflows/housekeeping-cron.yml` — cron + `workflow_dispatch` structure, permissions block
- `.github/workflows/ai-build-spike.yml` (lines 41-46) — GitHub App token generation pattern

**Test scenarios:**

- Happy path: Open Crowdin PR exists with only locale file changes -> PR is assigned, approved, auto-merge enabled
- Happy path (manual trigger): `workflow_dispatch` trigger finds and processes the Crowdin PR
- Edge case: No open Crowdin PR exists -> workflow exits gracefully with informational log, no error
- Edge case: Crowdin PR has non-locale files changed -> workflow exits with error, does not approve or merge
- Edge case: Crowdin PR already has auto-merge enabled -> workflow should not fail (idempotent)
- Error path: CI Bot token generation fails -> workflow fails with clear error

**Verification:**

- Workflow file passes YAML lint
- Manual `workflow_dispatch` trigger successfully finds and processes the open Crowdin PR
- When no Crowdin PR is open, the workflow exits cleanly without error status

## System-Wide Impact

- **Interaction graph:** The workflow interacts with: (1) the Crowdin SaaS integration that creates the PR, (2) the Danger workflow that validates PRs, (3) the merge queue that runs required checks before merging, (4) all `merge_group`-triggered workflows (`main.yml`, `autofix.ci.yml`, `app-deploy.yml`)
- **Error propagation:** If the file validation fails, the workflow errors without approving — the PR stays open for manual review. If the merge queue checks fail, GitHub's auto-merge aborts and the PR stays open.
- **State lifecycle risks:** If the cron fires multiple times before the PR merges (e.g., merge queue is slow), the concurrency group prevents parallel runs. The `--auto` flag is idempotent.
- **API surface parity:** No API changes. This is purely CI/CD automation.
- **Unchanged invariants:** All existing branch protection, required status checks, and merge queue behavior remain unchanged. The workflow works _within_ these constraints, not around them.

## Risks & Dependencies

| Risk                                                  | Mitigation                                                                                                                           |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Auto-merge must be enabled in repo settings           | Verify this is enabled; if not, the `--auto` flag will fail with a clear error                                                       |
| CI Bot App token may not have PR approval permissions | The app is already used to create PRs in `ai-build-spike.yml`; confirm it has `pull_requests: write`                                 |
| Crowdin PR branch name changes                        | The branch name `00-00-CI-chore-i10n-updates` is configured in `crowdin.yml` (root); if changed there, this workflow must be updated |
| Non-locale files pushed to the Crowdin branch         | The file-path safety guard (R2) prevents merging in this case                                                                        |

## Sources & References

- Linear ticket: [ENG-3672](https://linear.app/jesus-film-project/issue/ENG-3672/auto-approve-and-auto-merge-weekly-crowdin-translation-pr)
- Related ticket: [ENG-3565](https://linear.app/jesus-film-project/issue/ENG-3565/investigate-cursor-rulesscriptskills-to-improve-quality-control-in) (Crowdin quality control)
- Related code: `crowdin.yml`, `.github/workflows/crowdin.yml`, `.github/workflows/ai-build-spike.yml`, `dangerfile.ts`
