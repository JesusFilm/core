# Scripts (CI/ops glue)

The grab-bag of repo-operations scripts (`tools/scripts`): the Nx-affected helpers that feed CI matrices, the Stage Reset workflow, preview-deployment PR comments, and one-off ops utilities (DB backup/restore, ECR copy, env validation). Owns no product entities; vocabulary here is the CI/deployment pipeline's.

## Language

**Affected Projects**:
The set of Nx projects whose code changed relative to a base ref, emitted as a JSON array so GitHub Actions can fan out a job matrix over exactly the workspaces a PR touches.
_Avoid_: changed apps, dirty projects

**Deployable Service**:
An Affected Project that also has a `deploy` target — the intersection CI actually deploys. Affected but non-deployable projects (libs, tools) are filtered out.
_Avoid_: app (not every app is deployable, not every deployable is an app)

**Stage Reset**:
The maintenance operation that rebuilds the `stage` branch from `main` and re-merges every PR labelled "on stage", auto-resolving conflicts and posting to Slack when it can't. Dry-run by default; `--apply` is the destructive mode.
_Avoid_: stage rebase, stage sync

**On Stage**:
The PR label that marks a branch as belonging on the `stage` environment; the Stage Reset re-merges exactly this set.
_Avoid_: staged, in staging

**Preview Deployment Comment**:
The PR comment table of per-app Vercel preview URLs, generated from each deployed app's recorded URL; apps without one show as Ignored.
_Avoid_: deploy comment, vercel comment
