---
title: 'Re-check automated PR feedback after branch movement'
category: integration-issues
date: '2026-05-06'
status: resolved
severity: low
component: 'GitHub PR review, CodeRabbit, docs/plans, api-journeys-modern'
tags:
  - pr-review
  - coderabbit
  - review-retriage
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
  sync with the implementation. An initial challenge looked plausible, but a
  later bot reply correctly showed the branch had moved and the plan was stale
  against current HEAD.
root_cause: >
  Review feedback was triaged against an older local view of the branch. After
  the remote branch changed, api-journeys-modern used t.exposeBoolean for the
  new nullable booleans and the deprecation wording changed, while the plan
  still documented the previous explicit-resolver style and old removal text.
---

## Problem

On PR #9145 (`feat(api-journeys): per-card showAssistant + expandChatByDefault`), an unresolved CodeRabbit thread claimed the backend plan doc was stale and should be updated to match the final implementation.

The first triage challenged the comment because the local implementation appeared to match the plan. CodeRabbit then disputed that reply with fresh evidence from the current branch: `card.ts` had changed to `t.exposeBoolean(...)`, and the plan still documented the older explicit-resolver style.

## Root Cause

The failure was not the presence of automated feedback; it was treating an earlier verification as still authoritative after the branch moved:

- `apis/api-journeys-modern/src/schema/block/card/card.ts` now used `t.exposeBoolean('showAssistant', ...)` and `t.exposeBoolean('expandChatByDefault', ...)`.
- The backend plan still said to use explicit `t.boolean({ nullable: true, resolve })` and explicitly avoid `t.exposeBoolean`.
- `apis/api-journeys-modern/src/schema/journey/journey.ts` used `Removal tracked in NES-1624`, while the plan still had older NES-1585 removal wording in schema snippets.
- `CardBlockCreateInput` intentionally omitted the new fields; `CardBlockUpdateInput` included them.
- The plan already included the hardened World Cup SQL update runbook guidance.

## Solution

Treat automated review comments as hypotheses, but re-check them against current HEAD before doubling down on a challenge. In this case the correct final resolution was to acknowledge the correction, update the stale plan text, and resolve the review thread after the fix.

The workflow was:

1. Verify GitHub CLI authentication.
2. Fetch PR metadata and unresolved review threads through GitHub GraphQL so thread IDs, comment IDs, paths, and full thread bodies are available.
3. Read the full unresolved thread, not just the final recommendation.
4. Compare the review claim against the current plan doc and implementation files.
5. If the branch has moved, re-read the current files before relying on earlier conclusions.
6. Classify the thread as `Fix` when the current branch proves the plan is stale.
7. Reply inline acknowledging the correction, then post a PR summary after committing the fix.

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
- Re-run that verification after a rebase, merge from main, force-push, or any remote branch movement.
- Classify each thread as `Fix`, `Fix (adjusted)`, `Challenge`, or `Skip` before editing.
- If current code and docs agree, challenge the comment rather than making appeasement changes.
- If a reviewer or bot disputes the challenge with concrete evidence, re-triage from scratch instead of defending the previous conclusion.

## Prevention

Review automation is useful for surfacing leads, but it should not override the repo's source of truth. For plan-doc comments, validate both sides of the claim: what the plan says now and what the implementation does now.

A good follow-up reply is concise and evidence-led: acknowledge when the earlier challenge is wrong against current HEAD, name the files checked, and describe the doc update. Finish with a PR summary so reviewers can see the thread was handled intentionally rather than ignored.

## Related Patterns

- `docs/solutions/integration-issues/federation-subgraph-scalar-registration-hidden-prerequisites.md` documents the same "verify the spec against the actual codebase" discipline for GraphQL schema work.
- `docs/solutions/integration-issues/plugin-skill-discovery-in-dispatch-sessions.md` shows another case where review caught a mismatch between automated/accounting artifacts and the committed tree.
