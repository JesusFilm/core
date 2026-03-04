---
name: handle-pr-review
description: Fetches PR review comments, applies fixes, commits, pushes, and posts a summary comment. Use when the user asks to check review feedback, address PR comments, fix review issues, or handle review feedback.
---

# Handle PR Review Feedback

When the user asks to check or fix review feedback on a PR (e.g. on JesusFilm/core):

## Steps

1. **Identify PR** — From context (branch, issue number) or ask. Prefer GitHub API lookup by head branch (`GET /repos/{owner}/{repo}/pulls?head=owner:branch`); fall back to branch-name inference or listing PRs if needed. Use GraphQL `pullRequest.reviewThreads` (includes `isResolved`) for thread resolution state; REST `get_review_comments` and `get_reviews` do not expose it.

2. **Filter actionable** — Focus on unresolved threads (`reviewThreads.nodes[].isResolved === false`). Include CodeRabbit, CodeQL, or human comments. Skip nitpicks marked "optional" unless the user wants them.

3. **Fix** — Apply changes per comment. One commit per logical change (conventional: `fix:`, `chore:`). Atomic commits.

4. **Push** — `git push origin HEAD` (or `git push --set-upstream origin HEAD` if needed). Do not use `--force`; if unavoidable, use `--force-with-lease`.

5. **Comment** — Add a PR comment via `mcp_GitHub_add_issue_comment` summarizing:
   - What was fixed (with commit SHA)
   - What was intentionally not changed and why

## Example comment

```markdown
## Review feedback addressed (abc1234)

**Fixed:**
- [item]: [brief change]
- [item]: [brief change]

**Not changed:**
- [item]: [reason]
```

## Notes

- Resolved threads: skip; comment may say "Addressed in commits X to Y". Thread resolution requires GraphQL `reviewThreads`; REST does not expose it.
- If PR number unknown: first query PRs by head branch (`?head=owner:branch`); only use branch-name heuristics as fallback when API lookup is unavailable.
