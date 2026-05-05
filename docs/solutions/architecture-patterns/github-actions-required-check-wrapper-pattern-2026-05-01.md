---
title: GitHub Actions wrapper-job pattern for skippable required checks
date: 2026-05-01
category: architecture-patterns
module: github-actions
problem_type: architecture_pattern
component: tooling
severity: medium
related_components:
  - development_workflow
applies_when:
  - 'Adding a job-level `if:` guard to a job that is a required status check in branch protection'
  - 'A required GitHub Actions check is concluding `skipped` and blocking PR merge despite approvals and other green checks'
  - "You have a structural reason a required check cannot run on a class of PR (the check would actively conflict with those PRs), and `paths-ignore:` and ruleset edits don't fit your case"
tags:
  - github-actions
  - branch-protection
  - required-checks
  - conditional-jobs
  - wrapper-job
  - skipped-checks
  - ci
  - autofix
related:
  - docs/solutions/integration-issues/plugin-skill-discovery-in-dispatch-sessions.md
  - .claude/skills/sync-ce/SKILL.md
  - .github/workflows/autofix.ci.yml
---

# GitHub Actions wrapper-job pattern for skippable required checks

> **Use sparingly.** As of 2026-05-01, this pattern is used in exactly one place in `core` — the `/sync-ce` exclusion in `.github/workflows/autofix.ci.yml`. Skipping a required check for a class of PRs is an unusual choice, not a default tool for quieting noisy CI. The bar for adding a second instance should be high — see "Before adding a new skip condition" below.

## Context

GitHub branch protection treats a _required_ status check that concludes `SKIPPED` as **not passing** — same bucket as `PENDING`. So if you put a job-level `if:` guard on a required check and that condition evaluates to `false`, the job is skipped and any PR that hits that condition becomes `BLOCKED` from merging, even with all reviews approved and every other check green.

This bites when you have a _structural_ reason that a required check cannot run on a particular class of PR — for example, the work the check performs would actively conflict with what those PRs are doing — and you can't express that exclusion via `paths-ignore:` or by removing the check from your branch protection ruleset. In `core` today, the only case is `/sync-ce` PRs: the `autofix-ci/action` step would push commits that re-mangle the CE-managed files those PRs were created to sync.

**Empirical evidence from JesusFilm/core:** PR [#9095](https://github.com/JesusFilm/core/pull/9095) added `if: ${{ !contains(github.head_ref, '-chore-ce-sync-') }}` at the job level on `autofix.ci.yml`'s `lint` job. PR [#9096](https://github.com/JesusFilm/core/pull/9096) (a `/sync-ce` PR) immediately became `mergeStateStatus: BLOCKED`, `reviewDecision: APPROVED`, all other checks green, but `lint: status=COMPLETED, conclusion=SKIPPED`. PR [#9103](https://github.com/JesusFilm/core/pull/9103) fixed it with the wrapper-job pattern below.

References:

- [GitHub Community discussion #13690 — "Skipped jobs block required status checks"](https://github.com/orgs/community/discussions/13690)
- [GitHub Docs — Managing rulesets for a repository](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/managing-rulesets-for-a-repository)
- [GitHub Actions docs — `needs` context (`result` is one of `success | failure | cancelled | skipped`)](https://docs.github.com/en/actions/learn-github-actions/contexts#needs-context)

## Guidance

Rename the original job to `<name>-work` (keep the `if:` gate intact), then add a thin always-running `<name>` wrapper that translates the work job's `result` into the SUCCESS / FAILURE conclusion that branch protection sees.

```yaml
jobs:
  lint-work:
    if: ${{ !contains(github.head_ref, '-chore-ce-sync-') }}
    runs-on: blacksmith-2vcpu-ubuntu-2204
    strategy:
      matrix:
        node-version: [22]
    # ... env, all real lint steps unchanged ...

  # Required-check wrapper. Resolves `lint (22)` to SUCCESS when lint-work
  # succeeded OR was skipped (e.g. /sync-ce PRs), and FAILURE otherwise.
  # Matrix `node-version: [22]` mirrors the original `lint` job so the
  # check name reported to the ruleset stays `lint (22)`.
  lint:
    needs: lint-work
    if: always()
    runs-on: ubuntu-latest
    permissions: {}
    strategy:
      matrix:
        node-version: [22]
    steps:
      - name: Resolve lint-work result
        run: |
          result='${{ needs.lint-work.result }}'
          echo "lint-work concluded: $result"
          # Pass on success or skipped (sync-ce PRs); fail closed on everything else.
          if [ "$result" = "success" ] || [ "$result" = "skipped" ]; then
            exit 0
          else
            exit 1
          fi
```

### Truth table — all four `needs.<job>.result` values

| `lint-work.result` | Trigger                           | Wrapper exit | Wrapper conclusion | Branch protection                  |
| ------------------ | --------------------------------- | ------------ | ------------------ | ---------------------------------- |
| `success`          | Regular PR, all green             | 0            | SUCCESS            | allows merge                       |
| `skipped`          | Sync-ce PR, job-level `if:` false | 0            | SUCCESS            | **allows merge — this is the fix** |
| `failure`          | Any step in `lint-work` failed    | 1            | FAILURE            | blocks merge                       |
| `cancelled`        | Run cancelled                     | 1            | FAILURE            | blocks merge                       |

### Load-bearing details (don't drop these)

- **`if: always()` on the wrapper is the whole point.** Without it, when `lint-work` is skipped the wrapper is _also_ implicitly skipped (default `needs:` behaviour propagates `skipped` to dependents), reproducing the original bug. `always()` forces the wrapper to run regardless of upstream conclusion.
- **Preserve the required-check name via matrix.** GitHub reports the check as `<job> (<matrix value>)`, e.g. `lint (22)`. The wrapper must mirror the original matrix exactly so the check name in branch protection stays the same — no ruleset edit required.
- **`permissions: {}` on the wrapper.** It makes zero API calls (it only reads `needs.<job>.result` from workflow context). Empty permissions satisfies principle of least privilege and CodeQL's `actions/missing-workflow-permissions` rule.
- **Fail closed.** The `else exit 1` branch handles `failure`, `cancelled`, and any unexpected future value. A cancelled run must never certify a PR.
- **`runs-on: ubuntu-latest`.** Cheapest GitHub-hosted runner for a ~5-second job. No self-hosted runner, no secrets.

## Why This Matters

The pattern exists because GitHub gives you no other way to handle this specific situation: a required check has been added to a job, you discover a class of PR for which that job genuinely cannot run, and there's no path-based or workflow-level way to express the exclusion. The naive approach — adding a job-level `if:` directly to a required job — silently bricks merges for the very PRs you intended to unblock. Worse, the failure mode looks like "everything green but PR still blocked," which is one of the most confusing states in GitHub's UI and burns review cycles before someone notices the SKIPPED conclusion.

It is a workaround for a platform constraint, **not a feature to reach for when you want CI to be quieter on a particular PR class.** If you find yourself wanting it for noise reduction or convenience, the right answer is almost always one of: fix the noise at its source, use `paths-ignore:` at the workflow level, or remove the check from required entirely.

When you do need it, the wrapper pattern fixes the SKIPPED-blocking without:

- requiring admin access to edit the ruleset,
- giving up the safety net for non-targeted PRs,
- moving bypass logic outside of git (where it has no PR review trail).

It also keeps the diagnostic experience intact: when something genuinely breaks, the failure logs live on `lint-work` and the wrapper just mirrors the conclusion. Reviewers click the failed check and see the real output, same as before — they just click `lint-work (22)` instead of `lint (22)`.

## When to Apply

Use the wrapper-job pattern when **all** of these hold:

1. The check is **required** by branch protection (or a ruleset).
2. There is a _structural_ reason it cannot run on a specific class of PR — the check would actively conflict with what those PRs are doing, not just be noisy or slow.
3. You want to keep the check required for everyone else.
4. You've already considered and rejected the alternatives below.

You do **not** need this pattern if:

- The check isn't required (a normal job-level `if:` is fine).
- The PRs in question can be excluded via `paths-ignore:` at the workflow level — that skips the entire workflow, which branch protection handles cleanly because the check never starts.
- The right fix is to make the check non-required, or to fix the underlying noise/conflict at its source.
- Multiple workflows need the same gate — at that point a reusable workflow (`workflow_call`) is cleaner; see alternatives below.

**Current usage in `core`:** one instance — the `/sync-ce` PR exclusion in `autofix.ci.yml`. Justification: `/sync-ce` PRs auto-modify CE-managed files, and `autofix-ci/action` would push commits that re-mangle them. This is a structural conflict (not noise), `paths-ignore:` doesn't fit (CE-managed files are scattered across the repo), and the lint check must remain required so non-sync PRs continue to be auto-formatted.

## Before adding a new skip condition

If you're considering adding a second instance of this pattern, answer all of these first:

1. **Have you tried `paths-ignore:` at the workflow level?** Branch protection handles workflow-not-triggered cleanly because no check ever starts. If your exclusion can be expressed as paths, do that instead.
2. **Can the underlying check be moved out of the required set?** If the check is "nice to have" rather than "must pass before merge", removing it from the ruleset is simpler and more honest than wrapping it.
3. **Can the noisy/conflicting behaviour be fixed at its source?** A linter rule exception, an `.eslintignore` entry, or a configuration tweak is almost always preferable to skipping the whole check on certain PRs.
4. **Is the constraint structural or aesthetic?** "The check would push commits that break the PR" is structural. "The check is slow and annoying on these PRs" is aesthetic. Only structural constraints justify this pattern.
5. **Have you discussed it with the team?** Adding a skip condition expands the surface of "PRs that bypass our quality gates". That's a team-level decision, not an individual one.

Document your answers in the PR that adds the new skip — future maintainers will need them when the same question comes up again.

## Examples

### Triggering condition shape

The job-level `if:` on `<name>-work` is where you encode "which PRs skip the check." The only shape currently in use in `core`:

```yaml
# Skip for automated sync PRs by branch name prefix
if: ${{ !contains(github.head_ref, '-chore-ce-sync-') }}
```

Other shapes the `if:` _could_ take if a future use case justified it — **listed for syntax reference only, NOT as endorsed defaults:**

```yaml
# Bot-authored PRs (hypothetical — not in use)
if: ${{ github.event.pull_request.user.login != 'dependabot[bot]' }}

# Label-gated (hypothetical — especially risky, since manual escape hatches need strong justification)
if: ${{ !contains(github.event.pull_request.labels.*.name, 'skip-lint') }}
```

The wrapper job is identical regardless of which condition you pick — the real question is never "what shape can `if:` take?" but "is there a structural reason this class of PR genuinely cannot run the check?"

### Generalised wrapper template

```yaml
<name>-work:
  if: ${{ <your-skip-condition> }}
  # ... real job ...

<name>:
  needs: <name>-work
  if: always()
  runs-on: ubuntu-latest
  permissions: {}
  # mirror matrix here if the original job had one
  steps:
    - name: Resolve <name>-work result
      run: |
        result='${{ needs.<name>-work.result }}'
        echo "<name>-work concluded: $result"
        if [ "$result" = "success" ] || [ "$result" = "skipped" ]; then
          exit 0
        else
          exit 1
        fi
```

### Alternatives considered and rejected

| Alternative                                          | Why rejected                                                                                                                                                            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Step-level `if:` with a shared env var on every step | Same gate has to be repeated on every step (~15 in this case). Future steps added without the gate silently break the skip. Structurally fragile.                       |
| Reusable workflow split (`workflow_call`)            | Cleanest when the same gate must apply across multiple workflows, but over-engineered for a single workflow. Worth revisiting if a second workflow needs the same skip. |
| Drop the check from required / use ruleset bypass    | Requires admin access; weakens the safety net silently if the skip class ever expands; bypass condition lives outside git with no PR review trail.                      |

### Readability note from PR review

The original implementation used a bash `case` statement. PR review pushback was that CI files are read by humans of varying shell familiarity, and `if/else` is more universally legible. The semantics (`success|skipped` → exit 0, default → exit 1) are identical; prefer the form the rest of your team will read most easily. Same reasoning applied to renaming "shim" → "wrapper" in the comment block.

### Foot-guns for future maintainers

- **Existing PRs need a branch update after merging the fix to main.** GitHub Actions reads workflow files from the PR's _head_ commit for `pull_request` events, not from main. So the unblocked PR that motivated the fix won't actually be unblocked until you merge `main` into it (or rebase). On JesusFilm/core this meant PR #9096 needed a "Update branch" click after #9103 merged.
- **CodeQL findings on `<name>-work`.** Tightening permissions on the _real_ work job is a separate concern from the merge-blocking fix. Keep them in separate PRs — verifying actual permission needs of third-party actions (e.g. `autofix-ci/action` needs `contents: write` to push commits, possibly more) is a different review surface from "make required checks skippable."
- **Two checks now appear in the PR UI** (`lint-work (22)` and `lint (22)`). Cosmetic only — only `lint (22)` is required by branch protection. New devs unfamiliar with the pattern may first click `lint` to debug a failure, see the cryptic "lint-work concluded: failure" message, then realise the real logs are in `lint-work`. One extra click in the worst case.

## Conversation arc (how this came to be)

The fix came at the end of a chain of related PRs in JesusFilm/core. Capturing it here for future archaeologists:

| PR                                                   | Role              | Description                                                                                                                             |
| ---------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [#9056](https://github.com/JesusFilm/core/pull/9056) | setup             | `chore: add compound-engineering skills for Dispatch compatibility` — original CE plugin vendoring                                      |
| [#9091](https://github.com/JesusFilm/core/pull/9091) | failed attempt    | First CE sync attempt, surfaced the lint-on-CE-files problem                                                                            |
| [#9095](https://github.com/JesusFilm/core/pull/9095) | regression source | `ci: skip autofix.ci on /sync-ce-generated PRs` — added the job-level `if:`. **This introduced the SKIPPED-required-check regression.** |
| [#9096](https://github.com/JesusFilm/core/pull/9096) | blocked PR        | Re-run sync PR that got BLOCKED by the regression                                                                                       |
| [#9097](https://github.com/JesusFilm/core/pull/9097) | docs              | `docs: link sync-ce skill and autofix.ci skip guard` — docs follow-up                                                                   |
| [#9103](https://github.com/JesusFilm/core/pull/9103) | fix               | **The fix:** wrapper-job pattern (this doc)                                                                                             |

## Related

- [`docs/solutions/integration-issues/plugin-skill-discovery-in-dispatch-sessions.md`](../integration-issues/plugin-skill-discovery-in-dispatch-sessions.md) — sibling in the `/sync-ce` story (different failure mode, same umbrella)
- `.claude/skills/sync-ce/SKILL.md` — defines the `-chore-ce-sync-` branch-name pattern that the `if:` guard checks against; keep them in lockstep
- `.github/workflows/autofix.ci.yml` — the workflow this pattern was first applied to
