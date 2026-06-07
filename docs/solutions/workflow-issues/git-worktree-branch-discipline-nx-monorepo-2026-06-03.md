---
title: 'Git worktree + branch discipline for multi-branch work in the Nx monorepo'
date: 2026-06-03
category: workflow-issues
module: repo-wide
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - Doing work that must land on a specific branch while the main checkout is on another branch
  - Using git worktrees for parallel feature / PR work in this Nx + pnpm + Prisma monorepo
  - Making a fresh worktree able to run vitest / tsc / lint
tags:
  - git-worktree
  - branch-management
  - nx-monorepo
  - node-modules
  - prisma-generate
  - husky
  - commit-discipline
---

# Git worktree + branch discipline for multi-branch work in the Nx monorepo

## Context

During NES-1706 several avoidable git mistakes caused real churn: a commit landed on the wrong branch (the main checkout had been switched to a different feature branch, so a commit meant for the backend branch went onto the frontend branch); new throwaway branches were created for changes that belonged on an existing branch; an unrelated change (a media-index migration) got bundled onto a feature branch; and extra worktrees/branches had to be force-pushed and deleted to clean up. This captures the discipline that avoids the rework.

## Guidance

**One unit of work → one worktree → one branch → one PR.** For work that must land on a specific branch, pull that remote branch and open a dedicated worktree on it (`git worktree add <path> <branch>`); do the work there. Don't create a new branch for a change that belongs on an existing one, and don't bundle unrelated changes (e.g. a cross-domain migration) onto a feature branch — give genuinely separate work its own intentional branch (or confirm with the owner).

**Never commit to "whatever branch is checked out."** The shared main checkout (`/workspaces/core`) can be on a different branch than you think — verify `git branch --show-current` before committing, or (better) work in a dedicated worktree so the active branch is unambiguous. If a commit lands on the wrong branch: cherry-pick it onto the correct branch first, then `git reset --hard HEAD~1` on the wrong one (and force-push only branches you solely own).

**Make a fresh worktree a functional dev env before running tests.** A new worktree has no `node_modules` and no generated Prisma clients (both are gitignored), so vitest/tsc fail with "vitest not found" or "Cannot find module './**generated**/client/client'". Fix:

- `ln -s /workspaces/core/node_modules node_modules` — symlink the main checkout's installed deps (version-matched; avoids a full `pnpm install`).
- `npx nx prisma-generate prisma-<domain>` for every domain the code imports — not just the one you changed. Missing `users`/`languages` clients break cross-module `tsc` even when your change is unrelated (e.g. the email worker imports the users client).

**`git commit` in a worktree fails the husky hook.** A fresh worktree lacks `.husky/_/husky.sh`, so the pre-commit hook errors and _silently aborts the commit_ (the push then pushes nothing new). Run prettier / lint / tsc / tests manually, then `git commit --no-verify`.

**`rm -rf` of a generated dir deletes its tracked `.gitignore`.** `libs/prisma/<domain>/src/__generated__/.gitignore` is committed. If you `rm -rf` the dir (e.g. to reset a symlink), restore it with `git checkout -- <path>/.gitignore`, or the regenerated `client/` shows up as untracked.

## Why This Matters

Branch/worktree slips cause misplaced commits, force-pushes, reviewer confusion, and cleanup cycles — exactly the churn that frustrated the NES-1706 session. A dedicated, properly-set-up worktree per unit of work makes the target branch unambiguous and keeps unrelated changes from leaking into a PR.

## When to Apply

- Any parallel / multi-branch work, particularly via git worktrees.
- Whenever the main checkout's current branch may differ from the branch your change belongs on.

## Examples

Set up a working worktree on an existing remote branch and verify a spec runs:

```bash
git fetch origin
git worktree add .claude/worktrees/<name> <existing-branch>
cd .claude/worktrees/<name>
ln -s /workspaces/core/node_modules node_modules
npx nx prisma-generate prisma-journeys
npx nx prisma-generate prisma-media   # generate every domain the code imports
npx vitest run --config apis/api-journeys-modern/vitest.config.mts --coverage=false <spec-path>
git commit --no-verify -m "…"        # worktree has no husky; run checks manually first
```

## Related

- `docs/solutions/workflow-issues/prisma7-migrate-and-nx-codegen-schema-change-gotchas-2026-06-02.md` — sibling Prisma/Nx workflow gotchas.
- `.claude/rules/running-vitest-tests.md` — note about running vitest from inside the worktree (CWD-relative path resolution).
