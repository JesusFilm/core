# Deployment

## Stage

### Adding your Pull Request (PR) branch to the stage branch

1. Add "on stage" label to your PR.
1. GitHub Bot will attempt to merge your PR branch into the stage branch.
   ![Attempting](./stage-branch-merge-bot-attempting.png)
1. If a conflict exist between your PR branch and the stage branch you must resolve conflicts by manually. You will need to pull down the stage branch to your development container and merge the PR branch manually (alternatively you will need to reset the stage branch).
   ![Conflict](./stage-branch-merge-bot-conflict.png)
   1. Run `git checkout stage`
   1. Run `git merge my-pr-branch-name`
   1. Resolve conflicts between your PR branch and the stage branch
   1. Run `git push origin stage`

### Resetting the stage branch

From time to time the stage branch will need to be reset to main. This can happen for any number of reasons including but not limited to:

- Changes to stage branch were never merged to main e.g a PR was merged to stage then closed without merging to main.
- Conflicts were merged differently in stage than in main

#### Automated reset (recommended)

Use the `reset-stage` Cursor skill — it automates the entire process and handles merge conflicts automatically.

```bash
# Preview what would happen (no changes made)
./tools/scripts/reset-stage.sh

# Perform the actual reset
./tools/scripts/reset-stage.sh --apply
```

**What it does:**

1. Resets the local `stage` branch to `main`
2. Fetches all open PRs with the `on stage` label
3. Merges each one in turn — conflicts are auto-resolved by accepting the incoming PR's changes (`-X theirs`)
4. Force-pushes `stage` to origin, triggering the stage deploy workflows
5. Posts a summary to Slack with a breakdown of merged and auto-resolved PRs

**Why `-X theirs` is safe:** Stage is ephemeral — it exists only for integration testing and gets fully replaced on every reset. PR branches are the source of truth and are never modified. The worst outcome is a broken stage build, which is fixed by running the reset again.

In Cursor, you can also trigger this via the skill: type `/reset-stage` or ask "reset stage".

#### Manual reset (fallback)

If you need to reset without the script:

1. Run `git push -d origin stage`
1. Run `git branch -D stage` (This may fail if you don't have a local 'stage' branch)
1. Run `git checkout main`
1. Run `git pull origin main`
1. Run `git checkout -b stage`
1. Run `git push origin stage`
1. You will then need to merge into stage each [PR's currently labelled "on stage"](https://github.com/JesusFilm/core/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc+label%3A%22on+stage%22) by running `git merge origin/branch-name`
1. Once you've merged all the required branches then run `git push origin stage`
