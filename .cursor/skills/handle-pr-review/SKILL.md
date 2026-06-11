---
name: handle-pr-review
description: Fetches PR review comments, triages them (fix, challenge, or skip), applies holistic fixes, resolves threads, and posts a summary. Use when the user asks to check review feedback, address PR comments, fix review issues, or handle review feedback.
---

# Handle PR Review Feedback

<!-- sync: simplified subset of .claude/commands/handle-pr-review.md (canonical). Keep the summary comment step aligned. -->

When the user asks to check or fix review feedback on a PR (e.g. on JesusFilm/core):

## 1. Identify PR

From context (branch, issue number) or ask. Prefer looking up via `gh pr view --json number,url` from the current branch. Fall back to `gh api` by head branch or listing PRs.

## 2. Fetch unresolved threads (GraphQL)

Use GraphQL to get review threads **with thread IDs** (needed later to resolve them). REST does not expose `isResolved` or thread IDs.

```bash
gh api graphql -f query='
  query($owner:String!,$repo:String!,$pr:Int!) {
    repository(owner:$owner,name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100) {
          nodes {
            id
            isResolved
            comments(first:20) {
              nodes { id body author { login } path line createdAt }
            }
          }
        }
      }
    }
  }' -f owner=OWNER -f repo=REPO -F pr=NUMBER
```

Filter to `isResolved === false`. Collect every comment per thread together — thread context matters.

> **Pagination**: The query above fetches the first 100 threads and 20 comments each. For large PRs that exceed these limits, paginate using `pageInfo { hasNextPage endCursor }` and pass `after: endCursor` in follow-up queries. Nested pagination (threads × comments) requires custom looping — `gh api graphql --paginate` only handles a single connection.

## 3. Triage — classify each thread

Before writing any code, read **all** unresolved threads and the surrounding source code, then classify each into one of:

| Category | When | Action |
|---|---|---|
| **Fix** | Comment is correct and pragmatic | Plan the code change |
| **Challenge** | Comment is wrong, illogical, overly pedantic, contradicts project conventions, or would make the code worse | Draft a respectful reply explaining why (with evidence) |
| **Skip** | Marked "nit", "optional", "minor", or already resolved by another fix | Note it; no action unless user asks |

**How to challenge well:**
- Be respectful but direct. Cite project conventions, existing patterns, or technical reasoning.
- If the suggestion is partially valid, acknowledge what's useful and explain what you'd keep/change.
- Example: _"This pattern is consistent with how we handle X in `api-journeys/src/...`. Changing it here would diverge from the established convention without clear benefit."_

Present the triage to the user for confirmation before proceeding. Format:

```markdown
## Triage

**Will fix:**
- Thread 1: [summary] → [planned change]
- Thread 3: [summary] → [planned change]

**Will challenge:**
- Thread 2: [summary] → [draft reply]

**Will skip:**
- Thread 4: [summary] — marked optional
```

## 4. Analyse holistically before changing code

**Critical: do not fix comments one-by-one in isolation.**

- Read all files touched by "Fix" threads. Understand the broader context.
- Identify dependencies between comments (e.g. a rename in file A affects an import in file B).
- Plan all changes as a cohesive set — the combined diff should leave the code in a clean, consistent state.
- If fixing one comment conflicts with another, flag it to the user.

## 5. Apply fixes

- Make all planned changes.
- One commit per logical change (conventional: `fix:`, `refactor:`, `chore:`). Group related changes into a single commit rather than one commit per comment.
- Run lint/type-check on affected projects before committing: `npx nx run-many -t lint,type-check --projects=<affected>`.

## 6. Push

`git push origin HEAD` (or `git push --set-upstream origin HEAD` if needed). Do not use `--force`; if unavoidable, use `--force-with-lease`.

## 7. Resolve fixed threads (GraphQL)

For each thread that was fixed, resolve it:

```bash
gh api graphql -f query='
  mutation($threadId:ID!) {
    resolveReviewThread(input:{threadId:$threadId}) {
      thread { id isResolved }
    }
  }' -f threadId=THREAD_ID
```

Do **not** resolve threads that were challenged or skipped.

## 8. Post challenge replies

For each "Challenge" thread, reply inline on the thread via `gh api`:

```bash
gh api repos/OWNER/REPO/pulls/PR/comments/COMMENT_ID/replies \
  -f body="Your reply here"
```

Or if the thread is a top-level review comment, fall back to a PR-level comment:

```bash
gh pr comment PR_NUMBER --body "Your reply here"
```

## 9. Post summary comment

<!-- sync: keep "Post summary comment" aligned with the canonical version in .claude/commands/handle-pr-review.md -->

Add a PR comment summarising everything. **Resolve the commit SHA first** — do not rely on shell variable expansion inside heredocs:

```bash
COMMIT_SHA=$(git rev-parse --short HEAD)
gh pr comment NUMBER --body "## Review feedback addressed ($COMMIT_SHA)

**Fixed:**
- \`src/api.ts:42\` — [brief change description]

**Challenged:**
- \`src/util.ts:30\` — [brief reasoning — see inline reply]

**Skipped (optional/nit):**
- [thread summary] — [reason]
"
```

> **Important:** Do **not** use `<<'EOF'` (single-quoted heredoc) — it prevents
> shell variable expansion and renders `$COMMIT_SHA` as a literal string.
> Use `gh pr comment --body "..."` with double-quoted strings or unquoted heredocs
> (`<<EOF`) so that `$COMMIT_SHA` is interpolated.

## Notes

- **Never fix blindly** — every comment deserves critical evaluation. Reviewers can be wrong; the goal is the best code, not maximum compliance.
- **Thread context matters** — read the full thread conversation, not just the last comment. Earlier messages may contain context, agreements, or clarifications.
- **Resolved threads**: skip entirely; do not re-open.
- **CodeRabbit / CodeQL**: treat automated comments the same way — triage, don't auto-accept. Bots can produce false positives or suggestions that conflict with project style.
- If PR number is unknown: first try `gh pr view --json number` from the current branch; fall back to `gh api` by head branch.
