<!-- Keep in sync with .cursor/skills/review-pr/SKILL.md -->

Review a GitHub pull request for correctness, security, design, and maintainability. Default mode is **remote** (posts comments to GitHub). Pass `mode=local` to display findings without posting.

## Parameters

- `pr` — PR number or URL (optional; auto-detected from current branch if omitted)
- `mode` — `remote` (default) or `local`
- `auto` — `true` or `false` (default `false`). When `true`, skip the operator confirmation gate (Step 4) and proceed directly to posting/displaying. Use `COMMENT` as the review event (never `REQUEST_CHANGES` or `APPROVE` without a human).

| Mode                 | Behaviour                                                     |
| -------------------- | ------------------------------------------------------------- |
| **remote** (default) | Full review → post comments and submit review on GitHub       |
| **local**            | Same analysis → display findings in chat only, nothing posted |

---

## 0. Identify the PR

Detect from context (current branch, parameter, or URL). Prefer:

```bash
gh pr view --json number,url,baseRefName,headRefName
```

Fall back to asking the user.

## 1. Fetch the diff and PR metadata

```bash
gh pr diff NUMBER
gh pr view NUMBER --json title,body,files,additions,deletions,commits,isDraft,headRefOid
```

Fetch existing review comments to avoid duplicating feedback:

```bash
gh api graphql -f query='
  query($owner:String!,$repo:String!,$pr:Int!,$cursor:String) {
    repository(owner:$owner,name:$repo) {
      pullRequest(number:$pr) {
        reviewThreads(first:100, after:$cursor) {
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

If `pageInfo.hasNextPage` is `true`, repeat the query with `after: $cursor` using the `endCursor` value and accumulate all `reviewThreads` before deduplication.

## 1.5. Scope the review (large PRs)

If the PR touches **more than ~30 files**, prioritise:

| Priority | File type                                                                               | Action                                        |
| -------- | --------------------------------------------------------------------------------------- | --------------------------------------------- |
| **Deep** | Core logic, security-sensitive, public API surfaces, files with complex diffs           | Read surrounding context, review line-by-line |
| **Scan** | Tests (verify they test the right thing), internal utilities, straightforward refactors | Quick read for obvious issues                 |
| **Skim** | Generated files, lockfiles, config/CI, docs, renames/moves                              | Spot-check only; skip if mechanical           |

Use the file list from `gh pr view NUMBER --json files` to sort by `additions + deletions`. Start with the highest-churn non-generated files.

If the PR is too large to review meaningfully (100+ files with substantive logic changes), say so. Recommend the author split it, and offer to review a subset they nominate.

## 1.6. Load project-specific review context

This step makes the review aware of project conventions. Extract the list of changed file paths from step 1, then:

1. **Load matching rules.** Glob `.claude/rules/**/*.md` and `.cursor/rules/**/*.mdc`. For each rule file, check whether any changed file matches its `paths:` or `globs:` pattern. Read and collect all matching rules.

2. **Load AGENTS.md files.** For each changed file path, walk up the directory tree looking for `AGENTS.md` files (e.g., a change in `apps/journeys-admin/src/components/Foo.tsx` should load `apps/journeys-admin/AGENTS.md` if it exists). Deduplicate — don't load the same file twice.

3. **Merge into review context.** Concatenate the loaded rules and AGENTS.md content. These define the project conventions the review must enforce. If no rules or AGENTS.md files matched (e.g., docs-only changes), proceed with generic review — no conventions to enforce.

When triaging findings in step 3, **violations of loaded conventions are at minimum a Concern**. A violation of a rule marked as a guardrail (e.g., the customizable blocks sync rule) is **Critical**.

## 2. Understand the change

Before looking for problems:

1. Read the PR title, description, and commit messages to understand **intent**.
2. Scan the full diff to grasp the shape of the change.
3. Read surrounding source code for files with non-trivial changes.
4. Identify the type of change: feature, bugfix, refactor, config, docs, etc.

Do not start flagging issues until you understand what the author was trying to achieve and why.

If the PR description is empty or uninformative:

1. Infer intent from commit messages and the diff itself.
2. Note the gap in triage output: _"PR has no description — review is based on code and commit messages only. Risk of misunderstanding intent."_
3. If intent remains unclear after reading the code, ask the user before proceeding.

## 3. Triage — pragmatic, not pedantic

Review changed files (using the priority order from step 1.5 for large PRs). For each potential finding, classify it:

| Category     | When to flag                                                                                                                             | Example                                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Critical** | Bugs, security holes, data loss, broken logic, missing error handling that will bite in production, **guardrail rule violations**        | Race condition, SQL injection, unchecked null on a critical path, customizable block change missing sync |
| **Concern**  | Design issues, maintainability risks, unclear intent, missing tests for important behaviour, **convention violations from loaded rules** | Tight coupling, duplicated logic across files, using MUI in watch-modern, missing i18n wrapping          |
| **Nit**      | Style preference, minor naming, formatting — **only flag if pervasive pattern**                                                          | Single inconsistent variable name (skip), systematic naming convention violation across the PR (flag)    |
| **Skip**     | Acceptable as-is. Readable, works, follows project conventions — or too subjective to be worth raising                                   | Preferring `forEach` over `for...of`, minor comment wording                                              |

**Ground rules:**

- If it works, is readable, and follows project conventions — don't comment.
- Challenge your own findings: _"Would I mass-reject a PR over this?"_ If no, consider skipping.
- Group related issues. Don't leave 5 comments about the same pattern — leave one with context.
- Acknowledge what's done well when something is genuinely good.
- Never auto-approve and never block for style alone.

## 4. Present triage for confirmation

Before posting anything (remote mode) or finalising (local mode), present findings:

```markdown
## PR Review Triage — PR #123: <title>

**Conventions loaded:** (list the rules/AGENTS.md files that matched, or "none — generic review")

**Critical (must fix):**

- `src/auth.ts:42` — JWT secret read from env without fallback; server crashes on missing var
- `src/db.ts:88-91` — Raw SQL interpolation → SQL injection risk

**Concern (worth discussing):**

- `src/api/handler.ts:15-30` — New retry logic has no backoff; could hammer downstream service

**Nit (minor, pattern-level):**

- Inconsistent error message format across 4 new handlers (some use template literals, some concatenation)

**Positive:**

- Clean separation of validation logic into its own module
- Good test coverage on the happy path

**Skipped:** 3 minor style items — not worth comment noise.
```

**If `auto=false` (default):** Wait for user confirmation before proceeding.
The user may reclassify findings, drop items, or add context.

**If `auto=true`:** Log the triage for auditability (include it in the PR
summary comment later), then proceed immediately — do not wait for
confirmation.

## 5a. Remote mode — post the review

After confirmation, resolve OWNER, REPO, and the latest commit SHA:

```bash
gh repo view --json owner,name --jq '"\(.owner.login) \(.name)"'
COMMIT_SHA=$(gh pr view NUMBER --json headRefOid --jq '.headRefOid')
```

Choose the review event based on confirmed findings:

| Findings                   | Event                                     |
| -------------------------- | ----------------------------------------- |
| Any **Critical** items     | `REQUEST_CHANGES` — only if user confirms |
| Only **Concern** / **Nit** | `COMMENT`                                 |
| Nothing to flag            | `APPROVE` — only if user confirms         |

Default to `COMMENT` when unsure. Never auto-approve or auto-request-changes without user confirmation. For **draft PRs**, always use `COMMENT` regardless of findings.

**If `auto=true`:** Always use `COMMENT` regardless of findings. The operator
reviews the PR after the autonomous cycle completes — they decide whether to
request changes or approve.

Submit a **single** review with inline comments using `--input -`:

```bash
jq -n \
  --arg event "COMMENT" \
  --arg body "$(cat <<'BODY'
## Review summary

**Critical:** 2 items flagged (see inline)
**Concerns:** 1 item flagged (see inline)
**Overall:** Good direction, a few items to address before merge.
BODY
)" \
  --arg sha "$COMMIT_SHA" \
  '{
    event: $event,
    body: $body,
    commit_id: $sha,
    comments: [
      {path: "src/auth.ts", line: 42, side: "RIGHT",
       body: "**Critical:** JWT secret has no fallback — server will crash on missing env var. Consider a startup check or default."},
      {path: "src/db.ts", line: 91, side: "RIGHT", start_line: 88, start_side: "RIGHT",
       body: "**Critical:** Raw SQL interpolation → SQL injection risk."}
    ]
  }' \
| gh api repos/OWNER/REPO/pulls/NUMBER/reviews --method POST --input -
```

For multi-line comments, include both `start_line`/`start_side` and `line`/`side`. Use the category prefix (**Critical**, **Concern**, **Nit**) in each comment body.

After posting, confirm to the user what was posted and provide the PR URL.

## 5b. Local mode — display only

Present the full review in chat using the same format as the triage in step 4, but with full comment bodies for each finding. Nothing is posted to GitHub.

End with:

> Local review complete. Say **"post it"** to submit this review to GitHub (I'll confirm the event type first), or adjust findings.

If the user says "post it":

1. Confirm the review event type (see event table in step 5a).
2. Execute the remote posting flow from step 5a using the already-triaged findings.
3. Do not re-analyse the diff.

## Notes

- **Respect the author's context.** They may know things you don't. Frame concerns as questions when uncertain: _"Is there a reason this doesn't use...?"_
- **Don't duplicate existing feedback.** Check existing review threads before posting. If someone already raised it, skip or +1 briefly.
- **Check CI before reviewing.** If CI is red, note it but don't spend time reviewing code that may change. Tell the user: _"CI is failing — worth fixing that before a deep review."_
- **Forks.** `gh pr diff` and `gh pr view` work across forks transparently. The `headRefOid` from `gh pr view` is the correct commit for inline comments regardless of fork origin.
