---
title: 'Stale automated PR feedback on plan-doc drift'
category: integration-issues
date: '2026-05-06'
status: resolved
severity: low
component: 'GitHub PR review, CodeRabbit, docs/plans, api-journeys-modern'
tags:
  - pr-review
  - coderabbit
  - stale-review-feedback
  - plan-validation
  - graphql
  - pothos
  - api-journeys-modern
  - nes-1556
related:
  - https://github.com/JesusFilm/core/pull/9145
  - docs/plans/2026-05-03-001-feat-per-card-showassistant-and-expand-chat-plan.md
  - docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md
  - docs/solutions/integration-issues/plugin-skill-discovery-in-dispatch-sessions.md
symptom: >
  Automated review feedback claimed the per-card showAssistant plan was out of
  sync with the implementation, but the current plan and implementation already
  matched the valid parts of the recommendation.
root_cause: >
  The unresolved CodeRabbit thread was stale and internally inconsistent. Its
  suggested patch referenced one Pothos exposure style while its prose described
  another, and the branch had already settled on the explicit resolver style.
---

## Problem

On PR #9145 (`feat(api-journeys): per-card showAssistant + expandChatByDefault`), an unresolved CodeRabbit thread claimed the backend plan doc was stale and should be updated to match the final implementation.

The comment looked actionable because it referenced concrete lines in `docs/plans/2026-05-03-001-feat-per-card-showassistant-and-expand-chat-plan.md`. Applying it blindly would have created churn and risked making the plan less accurate.

## Root Cause

The review comment was a stale or malformed automated signal:

- The current plan already specified explicit `t.boolean({ nullable: true, resolve })` field exposure for `CardBlock`.
- `apis/api-journeys-modern/src/schema/block/card/card.ts` already used explicit `t.boolean` resolvers for `showAssistant` and `expandChatByDefault`.
- `CardBlockCreateInput` intentionally omitted the new fields; `CardBlockUpdateInput` included them.
- The plan already included the hardened World Cup SQL update runbook guidance.
- The bot comment contradicted itself by mixing `t.exposeBoolean` guidance with prose that asked for explicit `t.boolean`.

## Solution

Treat automated review comments as hypotheses, not instructions. The correct resolution was to challenge the thread with evidence instead of changing code or docs.

The workflow was:

1. Verify GitHub CLI authentication.
2. Fetch PR metadata and unresolved review threads through GitHub GraphQL so thread IDs, comment IDs, paths, and full thread bodies are available.
3. Read the full unresolved thread, not just the final recommendation.
4. Compare the review claim against the current plan doc and implementation files.
5. Classify the thread as `Challenge`.
6. Reply inline with the evidence and post a PR summary noting that no code changes were needed.

Useful GraphQL shape for fetching review-thread context:

```graphql
query ($owner: String!, $repo: String!, $pr: Int!) {
  repository(owner: $owner, name: $repo) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          id
          isResolved
          isOutdated
          path
          line
          comments(first: 30) {
            nodes {
              id
              databaseId
              body
              author {
                login
              }
            }
          }
        }
      }
    }
  }
}
```

Use the numeric `databaseId` when replying to a specific inline review comment:

```bash
gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments/COMMENT_DATABASE_ID/replies \
  -f body="Evidence-led reply here"
```

## Triage Checklist

- Check whether the thread is unresolved, resolved, or outdated before acting.
- Compare the bot's prose with any suggested patch; contradictions are a warning sign.
- Verify the referenced plan text against current source files, not against memory of earlier drafts.
- Classify each thread as `Fix`, `Fix (adjusted)`, `Challenge`, or `Skip` before editing.
- If current code and docs agree, challenge the comment rather than making appeasement changes.
- When no files change, do not commit or run unrelated test suites; state that no tests were run because the outcome was review triage only.

## Prevention

Review automation is useful for surfacing leads, but it should not override the repo's source of truth. For plan-doc comments, validate both sides of the claim: what the plan says now and what the implementation does now.

A good challenge reply is concise and evidence-led: state that the comment appears stale, name the files checked, identify the contradiction, and explain why no change is being made. Finish with a PR summary so reviewers can see the thread was handled intentionally rather than ignored.

## Related Patterns

- `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md` documents the same "verify the spec against the actual codebase" discipline for GraphQL schema work.
- `docs/solutions/integration-issues/plugin-skill-discovery-in-dispatch-sessions.md` shows another case where review caught a mismatch between automated/accounting artifacts and the committed tree.
