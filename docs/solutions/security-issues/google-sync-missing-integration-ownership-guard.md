---
title: "Google Sync export mutation missing integration ownership and team-scoping guards"
date: 2026-04-14
category: security-issues
module: api-journeys-modern
problem_type: security_issue
component: authentication
severity: high
root_cause: missing_permission
resolution_type: code_fix
symptoms:
  - Non-creator team members received unexpected errors when attempting Google Sheets sync
  - Google Sync dropdown showed all team integrations instead of only the current user's
  - Errors occurred even when users selected their own integration -- Google Drive picker returned 403
  - journeyVisitorExportToGoogleSheet accepted any integrationId without ownership validation
tags:
  - google-sheets
  - integration-ownership
  - authorization
  - team-scoping
  - graphql-mutation
  - pothos
  - defense-in-depth
related_components:
  - frontend_stimulus
---

# Google Sync export mutation missing integration ownership and team-scoping guards

## Problem

Google Sync (Google Sheets export) only worked for the team creator. Other managers and members received "Unexpected Error" from GraphQL and a 403 from the Google Drive folder picker, even when selecting their own integration. The frontend showed all team integrations in the dropdown regardless of ownership, and the backend export mutation (`journeyVisitorExportToGoogleSheet`) had no ownership or team-scoping checks -- allowing any authenticated team member to use another user's Google account via direct API calls.

## Symptoms

- Non-creator team members (managers and members) received unexpected errors when attempting Google Sheets sync
- The Google Sync dropdown in the `GoogleSheetsSyncDialog` displayed all team integrations, not just the current user's
- Even when a user selected their own integration, the sync failed with "Unexpected Error" from GraphQL; clicking "Choose folder" showed a Google Drive 403 ("We're sorry, but you don't have access to this page")
- The `journeyVisitorExportToGoogleSheet` mutation accepted any `integrationId` without validating the requesting user owned it
- The existing `ability(Action.Export, ...)` check only verified team membership, not per-resource integration ownership

## What Didn't Work

- **Targeted the wrong mutation** (session history): The initial PR (#8909 first iteration) modified `googleSheetsSyncCreate`, adding ownership guards there. However, the frontend never calls `googleSheetsSyncCreate` -- it exclusively calls `journeyVisitorExportToGoogleSheet`. The original `googleSheetsSyncCreate` already had correct auth via the `isIntegrationOwner` withAuth guard. All changes to it were reverted. Investigation should have traced the actual frontend code path first.

- **Assumed removing `isIntegrationOwner` was the fix** (session history): Early investigation assumed the `isIntegrationOwner` guard on `googleSheetsSyncCreate` was too restrictive. But since the frontend doesn't call that mutation, loosening it had no effect on the user-facing bug. The actual problem was the *absence* of any ownership check on the mutation the frontend *does* call.

## Solution

Two coordinated fixes across frontend and backend:

### Frontend fix (NES-1492, PR #8958)

Filter the Google Sync dropdown to only show the current user's integrations. The `userId` field was exposed on the `IntegrationGoogle` GraphQL type for client-side filtering. This resolved the user-facing bug (confirmed QA PASS on production).

### Backend fix (NES-1489, PR #8909)

File: `apis/api-journeys-modern/src/schema/journeyVisitor/journeyVisitorExportToGoogleSheet.mutation.ts`

Added two guard checks and moved the Google access token fetch after validation:

Before:
```typescript
// Validate integration
const accessToken = (await getIntegrationGoogleAccessToken(integrationId))
  .accessToken

const integrationRecord = await prisma.integration.findUnique({
  where: { id: integrationId },
  select: { id: true, accountEmail: true }
})
```

After:
```typescript
// Validate integration: must exist, belong to the journey's team,
// and be owned by the requesting user (privacy: only use your own Google account)
const integrationRecord = await prisma.integration.findUnique({
  where: { id: integrationId },
  select: { id: true, userId: true, teamId: true, accountEmail: true }
})

if (integrationRecord == null) {
  throw new GraphQLError('Integration not found', {
    extensions: { code: 'NOT_FOUND' }
  })
}

if (integrationRecord.teamId !== journey.teamId) {
  throw new GraphQLError(
    "Integration does not belong to this journey's team",
    { extensions: { code: 'FORBIDDEN' } }
  )
}

if (integrationRecord.userId !== context.user.id) {
  throw new GraphQLError(
    'You can only create syncs using your own Google account',
    { extensions: { code: 'FORBIDDEN' } }
  )
}

const accessToken = (await getIntegrationGoogleAccessToken(integrationId))
  .accessToken
```

Two test cases were added:
1. User doesn't own integration -> FORBIDDEN (verifies `getIntegrationGoogleAccessToken` is not called)
2. Integration from a different team -> FORBIDDEN (verifies `getIntegrationGoogleAccessToken` is not called)

## Why This Works

The user-facing root cause was never fully isolated. QA observed that non-creator team members received errors even when selecting their own Google integration from the dropdown -- the request appeared to carry the correct user and integration IDs. The Google Drive folder picker returned a 403 ("you don't have access"), suggesting a downstream auth check (possibly `getPickerToken`'s `isIntegrationOwner` withAuth guard) was rejecting the request despite correct-looking IDs.

> **Unverified speculation (not confirmed in code):** One hypothesis worth investigating if this recurs is a federation UUID vs Firebase UID mismatch, which was separately documented during the NES-1492 fix (see `docs/plans/2026-04-07-001-fix-google-sync-dropdown-userid-mismatch-plan.md`). That plan notes `IntegrationGoogle.user.id` returned a Prisma UUID via federation resolution while auth context used Firebase UIDs. *If* an auth guard somewhere compared these mismatched ID shapes, it could fail regardless of actual ownership -- but this was not traced to the actual source of the production error. Treat as a lead, not a conclusion.

**What is certain:**

- The frontend fix (NES-1492) resolved the user-facing bug -- confirmed QA PASS on production after it merged
- The backend fix adds the primary API-level privacy enforcement: the `ability(Action.Export, ...)` check only verifies team membership, not integration ownership. Without the `userId` guard, any authenticated team member could craft a direct GraphQL request using another user's `integrationId`.
- Moving `getIntegrationGoogleAccessToken()` after the ownership checks prevents unauthorized Google API calls from being made before the guards reject the request

**Note on userId nullability:** `Integration.userId` is `String?` (nullable) in the Prisma schema, but all existing integrations have `userId` set because the single creation path (`integrationGoogleCreate`) always assigns `userId = context.user.id`. The `!==` check works correctly for all real data.

## Prevention

- **Always trace which mutation the frontend actually calls** before modifying backend code. Do not assume based on mutation names -- search for the mutation import/usage in the frontend codebase.

- **Backend authorization must never rely on frontend filtering.** The GraphQL API is accessible to any authenticated caller. Frontend-only guards are bypassable via direct API requests.

- **When validating a resource ID argument, check three things:**
  1. The record exists
  2. It belongs to the correct team/context
  3. The requesting user owns it

  This is the same pattern documented in the `journey-acl-read-authorization-bypass` solution -- checking record existence alone (`!= null`) is insufficient for authorization.

- **For mutations that use third-party credentials** (Google OAuth tokens, API keys, etc.), validate ownership *before* fetching or using those credentials. Credential access is the sensitive boundary, not the downstream operation.

## Related Issues

- [NES-1489](https://linear.app/jesus-film-project/issue/NES-1489) -- Backend ownership guard fix (this solution)
- [NES-1492](https://linear.app/jesus-film-project/issue/NES-1492) -- Frontend dropdown filtering fix
- [NES-1392](https://linear.app/jesus-film-project/issue/NES-1392) -- Team members see other people's Google accounts (related)
- [PR #8909](https://github.com/JesusFilm/core/pull/8909) -- Backend fix PR
- [PR #8958](https://github.com/JesusFilm/core/pull/8958) -- Frontend fix PR
- Plan: `docs/plans/2026-03-25-002-fix-google-sync-permission-team-manager-plan.md`
- Related solution: `docs/solutions/security-issues/journey-acl-read-authorization-bypass-invite-requested-role.md` -- analogous ACL bypass pattern in the same module
