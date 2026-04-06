---
title: 'fix: Google Sync permission — enforce integration ownership on export mutation (NES-1489)'
type: fix
status: active
date: 2026-03-25
updated: 2026-04-06
linear: NES-1489
---

# fix: Google Sync permission — enforce integration ownership on export mutation

## Overview

Google Sync only works for the team creator because other team members were selecting the creator's Google integration from the dropdown. The frontend showed all team integrations (not just the current user's), and the actual export mutation (`journeyVisitorExportToGoogleSheet`) had no ownership or team-scoping checks.

## Root Cause Analysis

**Investigation uncovered three issues:**

1. **Frontend (NES-1492):** The Google Sync dropdown shows all team integrations, not just the current user's. Non-creators select the creator's integration and get blocked by auth checks (e.g. the Picker token query's `isIntegrationOwner` guard).

2. **Backend — wrong mutation targeted:** The initial PR (#8909) modified `googleSheetsSyncCreate`, but the frontend **never calls this mutation**. The frontend uses `journeyVisitorExportToGoogleSheet` exclusively.

3. **Backend — missing guards on the actual mutation:** `journeyVisitorExportToGoogleSheet` had no integration ownership check and no team-scoping check. Any authenticated team member could pass any `integrationId` (even from another team) and use someone else's Google account — a privacy vulnerability.

## Solution

### 1. Revert `googleSheetsSyncCreate` to `main` (no changes needed)

The original `isIntegrationOwner` withAuth guard + `ability(Action.Export, ...)` was already correct. The PR changes were unnecessary since the frontend doesn't call this mutation.

### 2. Add ownership + team guards to `journeyVisitorExportToGoogleSheet`

**File:** `apis/api-journeys-modern/src/schema/journeyVisitor/journeyVisitorExportToGoogleSheet.mutation.ts`

Added two checks before fetching the Google access token:

- **Team scoping:** `integrationRecord.teamId !== journey.teamId` → Forbidden
- **Ownership:** `integrationRecord.userId !== context.user.id` → Forbidden

The integration lookup was also moved **before** `getIntegrationGoogleAccessToken()` so that ownership is validated before any Google API calls are made using the integration's credentials.

### 3. Frontend filtering (separate PR #8938, NES-1492)

The sync dialog dropdown now filters integrations to only show the current user's. This guides users to set up their own Google account via the existing "Add New Google Account" OAuth flow.

## Permission Model

### `journeyVisitorExportToGoogleSheet` (the mutation the frontend calls)

| Check                                    | Purpose                                       | Error          |
| ---------------------------------------- | --------------------------------------------- | -------------- |
| `isAuthenticated` (withAuth)             | Must be logged in                             | Not authorized |
| `ability(Action.Export, ...)`            | Must be team manager/member or journey owner  | Forbidden      |
| `integration.teamId === journey.teamId`  | Integration must belong to the journey's team | Forbidden      |
| `integration.userId === context.user.id` | Must own the integration (privacy)            | Forbidden      |

### `googleSheetsSyncCreate` (not called by frontend — unchanged from main)

| Check                           | Purpose                  |
| ------------------------------- | ------------------------ |
| `isIntegrationOwner` (withAuth) | Must own the integration |
| `ability(Action.Export, ...)`   | Must have export access  |

### `googleSheetsSyncDelete` / `googleSheetsSyncBackfill` (unchanged)

| Check                                   | Purpose                   |
| --------------------------------------- | ------------------------- |
| `isIntegrationOwner \|\| isTeamManager` | Can manage existing syncs |

## End Result

With both the frontend (PR #8938) and backend changes:

- Any team member (manager or member) can create their own Google integration via OAuth
- The sync dropdown only shows their own integration(s)
- The backend enforces that users can only create syncs with their own Google account
- Even direct API calls are protected against cross-user integration misuse

## Files Changed

| File                                                 | Change                        |
| ---------------------------------------------------- | ----------------------------- |
| `googleSheetsSyncCreate.mutation.ts`                 | Reverted to `main`            |
| `googleSheetsSyncCreate.mutation.spec.ts`            | Reverted to `main`            |
| `journeyVisitorExportToGoogleSheet.mutation.ts`      | Added ownership + team checks |
| `journeyVisitorExportToGoogleSheet.mutation.spec.ts` | Added 2 new test cases        |

## Test Matrix — `journeyVisitorExportToGoogleSheet`

| Test Case                                   | Status             |
| ------------------------------------------- | ------------------ |
| Create new spreadsheet (happy path)         | Existing (passing) |
| Export to existing spreadsheet              | Existing (passing) |
| Default sheet name                          | Existing (passing) |
| Journey not found                           | Existing (passing) |
| User lacks export permission                | Existing (passing) |
| Integration not found                       | Existing (passing) |
| User does not own integration → Forbidden   | **New**            |
| Integration from different team → Forbidden | **New**            |
| Various validation errors                   | Existing (passing) |

## Related Tickets

- **NES-1489** — Google Sync only works for team creator (this PR)
- **NES-1492** — Dropdown shows other users' integrations (PR #8938)
- **NES-1392** — Team members see other people's Google accounts in integration list

## Sources

- **Linear ticket:** [NES-1489](https://linear.app/jesus-film-project/issue/NES-1489)
- **PR #8938:** Frontend filtering fix for NES-1492
- **Auth scopes:** `apis/api-journeys-modern/src/schema/authScopes.ts:27-44`
- **Export ability (journey ACL):** `apis/api-journeys-modern/src/schema/journey/journey.acl.ts:208-220`
