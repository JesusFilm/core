---
title: "fix: Google sync dropdown empty due to federation ID mismatch (NES-1492)"
type: fix
status: active
date: 2026-04-07
---

# fix: Google sync dropdown empty due to federation ID mismatch (NES-1492)

## Overview

**Production bug (NES-1492):** The Google Sheets sync dialog dropdown shows ALL team integrations — including those created by other managers. Manager B sees Manager A's Gmail in the dropdown.

**Regression from fix attempt (#8938, reverted as #8957):** The fix on the current branch (#8958) filters integrations by `integration.user?.id === currentUserId`, but this comparison always fails because `integration.user.id` returns a Prisma UUID (resolved via federation through `api-users`) while `useAuth().user.id` returns the Firebase UID. This causes the dropdown to show NO integrations at all — worse than the original bug.

## Root Cause

1. `googleCreate.mutation.ts` stores `context.user.id` (Firebase UID) as `integration.userId`
2. `google.resolver.ts` returns `{ __typename: 'User', id: integration.userId }` as a federation reference
3. `api-users` resolves the reference via `findOrFetchUser` which returns a Prisma `User` object
4. `AuthenticatedUser.id` in the Pothos schema is `t.exposeID('id')` — this exposes the **Prisma UUID**, not `userId` (Firebase UID)
5. Frontend receives `integration.user.id` = Prisma UUID, compares against `useAuth().user.id` = Firebase UID
6. Comparison always fails -> empty dropdown

## Fix: Expose `userId` scalar on `IntegrationGoogle`

Bypass the federation hop by exposing the Firebase UID directly as a scalar field. This is consistent with 10+ other types that already expose `userId` (UserJourney, UserRole, JourneyProfile, JourneyNotification, JourneyTheme, etc.).

## Acceptance Criteria

- [ ] `IntegrationGoogle` GraphQL type exposes `userId: ID` in both `api-journeys` and `api-journeys-modern`
- [ ] `GetIntegration` query fetches `userId` on `IntegrationGoogle` fragment (keep existing `user { id }` — used by `GoogleIntegrationDetails`)
- [ ] `GoogleSheetsSyncDialog` filters integrations using `integration.userId === currentUserId`
- [ ] Generated types regenerated via codegen (not manually edited)
- [ ] Dropdown shows only the current user's Google integrations
- [ ] Dropdown correctly shows empty for users with no integrations
- [ ] Multi-manager teams: each manager sees only their own integrations
- [ ] Tests updated to cover the userId-based filter

## Implementation Steps

### Step 1: Backend — `api-journeys` (NestJS, schema-first)

**File:** `apis/api-journeys/src/app/modules/integration/google/google.graphql`

Add `userId` field. NestJS auto-resolves scalar fields matching the parent object property name — no resolver change needed.

```graphql
type IntegrationGoogle implements Integration @shareable {
  id: ID!
  team: Team!
  type: IntegrationType!
  user: User
  userId: ID
  accountEmail: String
}
```

**No change needed to `google.resolver.ts`** — `integration.userId` is a scalar column on the Prisma `Integration` model and will be auto-resolved.

### Step 2: Backend — `api-journeys-modern` (Pothos)

**File:** `apis/api-journeys-modern/src/schema/integration/google/google.ts`

Add `userId` field following the codebase pattern:

```typescript
fields: (t) => ({
  accountEmail: t.exposeString('accountEmail', { nullable: true }),
  userId: t.exposeID('userId', { nullable: true }),
  team: t.relation('team', { nullable: false }),
  user: t.field({
    type: UserRef,
    nullable: true,
    resolve: async (integration) => {
      if (integration.userId == null) return null
      return { id: integration.userId }
    }
  })
})
```

### Step 3: Frontend — Update GraphQL query

**File:** `apps/journeys-admin/src/libs/useIntegrationQuery/useIntegrationQuery.ts`

**Add** `userId` to the `IntegrationGoogle` fragment. **Keep `user { id }` in place** — `GoogleIntegrationDetails` uses it for an ownership check (UUID-to-UUID comparison via `me` query that works correctly).

```graphql
... on IntegrationGoogle {
  id
  type
  userId
  user {
    id
    ... on AuthenticatedUser {
      email
    }
  }
  accountEmail
}
```

### Step 4: Frontend — Regenerate types

Run the project's GraphQL codegen to update `apps/journeys-admin/__generated__/GetIntegration.ts`. Do NOT manually edit generated files — they'll be overwritten on next codegen run.

### Step 5: Frontend — Fix the filter

**File:** `apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.tsx`

Replace the current filter to use `userId` (Firebase UID) instead of `user.id` (Prisma UUID):

```typescript
const currentUserId = user?.id
const currentUserIntegrations =
  currentUserId != null
    ? (integrationsData?.integrations?.filter(
        (integration) =>
          integration.__typename === 'IntegrationGoogle' &&
          integration.userId === currentUserId
      ) ?? [])
    : []
```

Also update `renderValue` and the `MenuItem` mapping to use `currentUserIntegrations` (already done in the current branch — just need to fix the filter field).

Remove the import of `GetIntegration_integrations_IntegrationGoogle` since we no longer need the type guard for the `user` field — the `__typename` check plus `userId` comparison is sufficient.

### Step 6: Update tests

**File:** `apps/journeys-admin/src/components/JourneyVisitorsList/FilterDrawer/GoogleSheetsSyncDialog/GoogleSheetsSyncDialog.spec.tsx`

- Update mock data to include `userId` field on `IntegrationGoogle` objects (keep existing `user { id }` in mocks to match query shape)
- Add test: integration with matching `userId` appears in dropdown
- Add test: integration with different `userId` does NOT appear in dropdown
- Add test: integration with `null` userId does NOT appear in dropdown

## Edge Cases

| Scenario | Expected behavior |
|---|---|
| Integration with `userId: null` (legacy data, Oct 21 2025 only) | Excluded from dropdown — extremely rare (feature launched Oct 21, userId added Oct 22). User would need to re-create. |
| User is `null` on initial render (auth loading) | `currentUserId` is undefined, filter returns `[]` — empty state shown briefly until auth resolves |
| Multiple Google integrations per user | All shown — distinguished by `accountEmail` |
| OAuth creates new integration | Apollo cache updates via mutation response — dropdown populates on re-query |

## Sources

- PR #8958 (current branch with reverted changes)
- PR #8957 (revert PR, merged)
- Linear ticket: NES-1492
