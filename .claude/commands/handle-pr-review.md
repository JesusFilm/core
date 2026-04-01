Fetch PR review comments, triage them (fix, challenge, or skip), apply holistic fixes, resolve threads, and post a summary.

<!-- sync: this file must stay in sync with .cursor/skills/handle-pr-review/SKILL.md -->

## Parameters

- `pr` — PR number or URL (optional; auto-detected from current branch if omitted)
- `auto` — `true` or `false` (default `false`). When `true`, skip the operator confirmation gate (Step 3) and proceed directly to holistic analysis and fixes. Intended for build-loop autonomous invocation.

---

## 0. Prerequisites

Verify GitHub CLI authentication before any API calls:

```bash
gh auth status
```

If auth fails, stop and tell the user to run `gh auth login`.

## 1. Identify PR

Detect from context (branch, parameter, or URL). Prefer:

```bash
gh pr view --json number,url,state,isDraft,baseRefName,headRefName
```

Fall back to `gh api` by head branch or listing PRs.

**Check PR state before proceeding:**

| State | Action |
|-------|--------|
| **Open** | Proceed normally |
| **Draft** | Proceed, but note that the PR is still in draft — reviewer expectations may differ |
| **Merged / Closed** | Stop and inform user; no action to take |

## 2. Fetch unresolved threads (GraphQL)

Use GraphQL to get review threads **with thread and comment IDs** (needed to resolve threads and post replies). REST does not expose `isResolved` or thread IDs.

```bash
gh api graphql -f query='
  query($owner:String!,$repo:String!,$pr:Int!) {
    repository(owner:$owner,name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            isResolved
            isOutdated
            path
            line
            viewerCanResolve
            comments(first:30) {
              nodes {
                id
                databaseId
                body
                author { login }
                path
                line
                originalLine
                createdAt
              }
            }
          }
        }
      }
    }
  }' -f owner=OWNER -f repo=REPO -F pr=NUMBER
```

**Post-fetch processing:**

- Filter to `isResolved === false`. Collect every comment per thread together — thread context matters.
- **Outdated threads** (`isOutdated === true`): the referenced code has changed since the comment was posted. Read the current code — the concern may already be addressed. If so, resolve the thread without a code change and note it in the summary.
- **Pagination:** If `pageInfo.hasNextPage` is `true`, re-query with `reviewThreads(first:100, after:"ENDCURSOR")` using the `endCursor` value. Repeat until all pages are collected.

> **Note on IDs:** The `databaseId` on each comment is the numeric REST ID needed for the reply endpoint in step 9. The `id` field is the GraphQL node ID needed for resolving threads in step 8. Keep both.

## 3. Triage — classify each thread

Before writing any code, read **all** unresolved threads and the surrounding source code, then classify each:

| Category | When | Action |
|----------|------|--------|
| **Fix** | Feedback is correct: real bug, valid improvement, catches something missed, or aligns with project conventions | Plan the code change |
| **Fix (adjusted)** | Core concern is valid but the suggested approach isn't ideal — you'll address the underlying issue your own way | Plan your solution; note the deviation |
| **Challenge** | Feedback is incorrect, conflicts with project conventions, misunderstands context, would degrade the code, or is overly pedantic on a subjective point | Draft a respectful reply with evidence |
| **Skip** | Marked "nit" / "optional" / "take it or leave it", already resolved by another fix, or outdated thread whose concern was addressed by subsequent commits | Note it; no action unless user asks |

**Ground rules:**

- Every comment deserves critical evaluation. Reviewers can be wrong; the goal is the best code, not maximum compliance.
- If a thread has multiple back-and-forth replies, read the **entire** conversation. Earlier messages may contain agreements, context, or clarifications that change the conclusion.
- Group related threads. If 3 threads raise the same concern in different files, plan one cohesive fix, not 3 isolated patches.
- **Automated comments** (CodeRabbit, CodeQL, Copilot, SonarCloud, etc.): triage the same way. Bots produce false positives and suggestions that conflict with project style. Do not auto-accept.

**How to challenge well:**

Be respectful but direct. Cite project conventions, existing patterns, or technical reasoning.

| Scenario | Example reply |
|----------|---------------|
| **Architecture disagreement** | *"We considered [approach] but chose [current pattern] because [reason]. The trade-off is [X], but for this use case [benefit] outweighs [cost]. Happy to discuss if you see a risk I'm missing."* |
| **Bot false positive** | *"This is a false positive — [tool] flags [pattern] generically, but here [explanation of why the flagged code is correct]. See [link/reference] for context."* |
| **Subjective style preference** | *"This follows the existing pattern in [file/module]. Both approaches are valid; I lean toward consistency with surrounding code."* |
| **Reviewer missing context** | *"Good question. The reason for [approach] is [constraint/requirement]. I'll add a code comment to make this clearer."* |
| **Over-engineering suggestion** | *"Agree this could benefit from [abstraction] at scale, but currently there's only [N] usage(s). Prefer to keep it simple and extract when a clear pattern emerges."* |
| **Partial agreement** | *"The [specific part] is a good catch — I've addressed that. I kept [other part] as-is because [reason]."* |

Present the triage to the user for confirmation before proceeding:

```
## Triage — PR #123

**Will fix:**
- Thread 1 (`src/api.ts:42`): [summary] → [planned change]
- Thread 3 (`src/db.ts:88`): [summary] → [planned change]

**Will fix (adjusted):**
- Thread 5 (`src/auth.ts:15`): [summary] → [your approach, deviation noted]

**Will challenge:**
- Thread 2 (`src/util.ts:30`): [summary] → [draft reply]

**Will skip:**
- Thread 4: [summary] — marked optional
- Thread 6: outdated — concern addressed by commit abc1234
```

**If `auto=false` (default):** Wait for user confirmation before proceeding.
The user may reclassify items, drop threads, or add context.

**If `auto=true`:** Log the triage for auditability (include it in the PR
summary comment in Step 10), then proceed immediately — do not wait for
confirmation. The operator reviews the full triage in the PR summary after
the autonomous cycle completes.

## 4. Analyse holistically before changing code

**Critical: do not fix comments one-by-one in isolation.**

- Read all files touched by "Fix" threads. Understand the broader context.
- Identify dependencies between comments (e.g. a rename in file A affects an import in file B).
- Plan all changes as a cohesive set — the combined diff should leave the code in a clean, consistent state.
- If fixing one comment conflicts with another, flag it to the user.

## 5. Apply fixes

Make all planned changes, then verify.

### Discover project tooling

Check these locations (in order) to find lint, type-check, and test commands:

1. **CI config** — `.github/workflows/*.yml`, `.gitlab-ci.yml`, `Jenkinsfile`, `.circleci/config.yml`
2. **Task runner** — `Makefile`, `Justfile`, `Taskfile.yml`
3. **Package manager** — `package.json` (`scripts` section), `pyproject.toml` (`[tool.*]` and `[project.scripts]`), `Cargo.toml`
4. **Linter/checker config** — `.eslintrc*`, `tsconfig.json`, `ruff.toml`, `mypy.ini`, `.golangci.yml`

Run the discovered lint / type-check / test suite. If no tooling is discoverable, ask the user.

### Commit discipline

- One commit per logical change (conventional prefixes: `fix:`, `refactor:`, `chore:`).
- Group related changes into a single commit rather than one commit per comment.
- Reference the feedback being addressed in the commit message body.

## 6. Pre-push CI check

Before pushing, check for issues that would waste a review round:

```bash
gh pr checks NUMBER
```

```bash
git fetch origin BASE_BRANCH
git merge-base --is-ancestor origin/BASE_BRANCH HEAD || echo "base has diverged"
```

| Situation | Action |
|-----------|--------|
| **CI was already failing** before your changes | Note it to user; push your fixes anyway |
| **Your changes break CI** | Fix before pushing |
| **Merge conflicts with base** | Inform user; offer to rebase or merge. Prefer rebase for clean history unless the branch has shared collaborators |

## 7. Push

```bash
git push origin HEAD
```

Use `--set-upstream origin HEAD` if the branch has no upstream. Do **not** use `--force`; if unavoidable, use `--force-with-lease` and inform the user.

## 8. Resolve fixed threads (GraphQL)

For each thread that was fixed, resolve it using the GraphQL **node ID** (`id` field from step 2):

```bash
gh api graphql -f query='
  mutation($threadId:ID!) {
    resolveReviewThread(input:{threadId:$threadId}) {
      thread { id isResolved }
    }
  }' -f threadId=THREAD_ID
```

Do **not** resolve threads that were challenged or skipped.

If `viewerCanResolve` was `false` for a thread, note it in the summary and move on.

## 9. Post challenge replies

For each "Challenge" thread, reply inline using the **numeric database ID** (`databaseId` from step 2):

```bash
gh api repos/OWNER/REPO/pulls/PR/comments/DATABASE_ID/replies \
  -f body="Your reply here"
```

If the thread is a top-level review comment (not an inline diff comment), fall back to:

```bash
gh api repos/OWNER/REPO/issues/PR/comments -f body="Your reply here"
```

## 10. Post summary comment

<!-- sync: this step must stay in sync with .cursor/skills/handle-pr-review/SKILL.md step 9 -->

Add a PR comment summarising everything. **Resolve the commit SHA first** — do not rely on shell variable expansion inside heredocs:

```bash
COMMIT_SHA=$(git rev-parse --short HEAD)
gh pr comment NUMBER --body "## Review feedback addressed ($COMMIT_SHA)

**Fixed:**
- \`src/api.ts:42\` — [brief change description]
- \`src/db.ts:88\` — [brief change description]

**Fixed (adjusted):**
- \`src/auth.ts:15\` — [what changed and why approach differs from suggestion]

**Challenged:**
- \`src/util.ts:30\` — [brief reasoning — see inline reply]

**Skipped (optional/nit):**
- [thread summary] — [reason]

**Outdated (already addressed):**
- [thread summary] — resolved; addressed in [commit]
"
```

> **Important:** Do **not** use `<<'EOF'` (single-quoted heredoc) — it prevents
> shell variable expansion and renders `$COMMIT_SHA` as a literal string.
> Use `gh pr comment --body "..."` with double-quoted strings or unquoted heredocs
> (`<<EOF`) so that `$COMMIT_SHA` is interpolated.

## Notes

- **Never fix blindly.** Every comment deserves critical evaluation. Reviewers can be wrong; the goal is the best code, not maximum compliance.
- **Thread context matters.** Read the full thread conversation, not just the last comment.
- **Resolved threads:** Skip entirely; do not re-open or re-evaluate.
- **Dismissed reviews:** If a review was dismissed, its threads may still be unresolved. Treat unresolved threads from dismissed reviews the same as any other — triage on merit.
- **Multiple review rounds:** If running repeatedly on the same PR, only fetch and triage *new* unresolved threads. Reference prior summary comments to avoid re-addressing already-handled feedback.
- **Forks:** `gh pr view` and `gh api graphql` work across forks transparently. Use the base repo's owner/name in API calls.
- **Automated tools:** CodeRabbit, CodeQL, Copilot, SonarCloud — triage the same as human feedback. Do not auto-accept bot suggestions.

**Common errors and recovery:**

| Error | Recovery |
|-------|----------|
| `gh auth status` fails | Run `gh auth login` |
| GraphQL `INSUFFICIENT_SCOPES` | Token needs `repo` scope; re-auth with `gh auth login -s repo` |
| 404 on PR number | Verify PR exists and is accessible: `gh pr view NUMBER` |
| Rate limiting (403 with `retry-after` header) | Wait the indicated duration and retry; batch mutations where possible |
| Thread resolve fails | Check `viewerCanResolve`; may need maintainer permissions |
| Reply endpoint returns 422 | Comment may have been deleted or thread was converted; fall back to issue comment |
