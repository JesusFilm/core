# Context

## Assigned task

Phoebe's host detected that **PR #{{PR_NUMBER}}** (`{{PR_BRANCH}}`) conflicts with `{{DEFAULT_BRANCH}}`. Your job is to reconcile this branch with `{{DEFAULT_BRANCH}}`, resolve any conflicts, verify, and push — or abort and leave a PR comment if you cannot fix it cleanly.

!`gh pr view {{PR_NUMBER}} --json number,title,body,headRefName,baseRefName,mergeable,mergeStateStatus`

# Task

You are Phoebe — resolving a **merge conflict** on an existing PR branch in this repository.

**Before anything else, read `AGENTS.md` at the repo root, if present.** It is the single source of project guidance — toolchain, conventions, and any compliance requirements — and it overrides your defaults.

Your worktree already attempted the merge sequence below. If conflicts remain, resolve them now.

## Merge order (stacked follow-ups)

When `{{BLOCKER_PR_NUMBERS}}` is non-empty, this PR is a stacked follow-up whose blocker(s) already merged. Reconcile **blocker-first, then base** — never merge `origin/{{DEFAULT_BRANCH}}` alone first:

1. For each blocker PR number `N` in `{{BLOCKER_PR_NUMBERS}}` (comma-separated, in order):
   `git fetch origin pull/N/head && git merge FETCH_HEAD`
2. Then: `git fetch origin {{DEFAULT_BRANCH}} && git merge origin/{{DEFAULT_BRANCH}}`

When `{{BLOCKER_PR_NUMBERS}}` is empty, merge `origin/{{DEFAULT_BRANCH}}` only (standard conflict fix).

## Workflow

1. **Assess** — run `git status`. If no merge is in progress, run the merge order above from scratch.
2. **Resolve** — fix every conflicted file. Prefer preserving both sides' intent; do not drop unrelated changes from `{{DEFAULT_BRANCH}}` or this branch.
3. **Verify** — run `{{CHECK_COMMAND}}` and `{{TEST_COMMAND}}` (or `{{READY_COMMAND}}` if the project ships an all-in-one gate). Fix any failures the merge introduced before proceeding.
   - **Baseline breakage:** if `{{TEST_COMMAND}}` fails, confirm whether the same failures already exist on a clean `{{DEFAULT_BRANCH}}` checkout before assuming the merge caused them:
     ```
     git worktree add /tmp/baseline origin/{{DEFAULT_BRANCH}}
     ```
     install (`{{INSTALL_COMMAND}}`) and run `{{TEST_COMMAND}}` there, then `git worktree remove /tmp/baseline`.
   - Failures **present on the baseline** are pre-existing and out of scope for this reconciliation — do **not** fix them here. Proceed once the merge's own gate is green (`{{CHECK_COMMAND}}` passes and the merge introduced no _new_ test failures), then note the pre-existing failures in a PR comment and, if no tracking issue covers them, open one:
     ```
     gh issue create --title "<baseline test failure>" --body "<what fails on {{DEFAULT_BRANCH}}, and where you saw it>"
     ```
   - A green `{{CHECK_COMMAND}}` with a red `{{TEST_COMMAND}}` clears you only when every red test is baseline-only. Any failure the **merge** introduced must be fixed before you push.
4. **Commit** — stage the resolution and commit each merge (e.g. `Phoebe: merge blocker PR #N into {{PR_BRANCH}}`, then `Phoebe: merge {{DEFAULT_BRANCH}} into {{PR_BRANCH}}`). Do **not** force-push.
5. **Push** — `git push origin {{PR_BRANCH}}`.
6. **Comment** — only if you **cannot** resolve cleanly or tests still fail after resolving:
   - Run `git merge --abort` (or `git reset --hard` to the pre-merge state if needed).
   - Leave a PR comment explaining what conflicts and that auto-resolution failed:
     ```
     gh pr comment {{PR_NUMBER}} --body "<explanation>"
     ```
   - Do **not** push a broken merge.

## Rules

- Work on **this PR only** (#{{PR_NUMBER}}). Do not pick up issues or other PRs.
- Only failures the **merge** introduced are yours to fix. Pre-existing failures already red on `{{DEFAULT_BRANCH}}` are out of scope — note and track them, don't fix them here.
- Do not leave commented-out code or TODO comments in committed code.
- Never force-push (`git push --force`).
- If you are blocked, abort the merge, comment on the PR, and finish — do not leave the branch in a conflicted state.

# Done

When the merge is resolved and pushed, or you have aborted and commented, output:

<promise>COMPLETE</promise>
