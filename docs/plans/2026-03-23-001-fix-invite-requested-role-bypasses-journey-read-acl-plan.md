---
title: "fix: inviteRequested role bypasses journey read ACL in modern API"
type: fix
status: completed
date: 2026-03-23
---

# fix: inviteRequested role bypasses journey read ACL in modern API

## Enhancement Summary

**Deepened on:** 2026-03-23 (2 rounds)
**Agents used:** security-sentinel, architecture-strategist, pattern-recognition-specialist, kieran-typescript-reviewer, code-simplicity-reviewer, git-history-analyzer, performance-oracle, best-practices-researcher, codebase-wide ACL auditor

### Key Improvements from Deepening
1. **Defense-in-depth**: Add explicit role checks on the `userTeam` path too (not just `userJourney`), matching the `update()` pattern exactly — consensus from security, architecture, pattern, and TypeScript reviewers
2. **Historical context**: Bug is an original oversight from May 2025 when the modern API was written, not a regression. The implicit default-deny of CASL was lost during the imperative port
3. **Additional affected code path**: `addPermissionsWithNames` in template family stats also routes through the buggy `read()` — automatically fixed by this change
4. **Codebase audit**: All 19 ACL files in the codebase were audited — this is the **only instance** of the null-check-without-role bug
5. **Zero performance impact**: The fix adds negligible in-memory string comparisons to a function dominated by database I/O

---

## Overview

Users with the `inviteRequested` journey role can open the journey editor via direct URL, but see a blank canvas (no blocks rendered) and console errors from plausible stats ("User is not allowed to view journey"). The root cause is that the `read()` function in the modern API's `journey.acl.ts` checks only for the **existence** of a `userJourney` record, not the role value — so `inviteRequested` passes the Read check while correctly failing all downstream Update/Manage checks.

**Severity: HIGH** — This is a confirmed authorization bypass (OWASP A01: Broken Access Control). An attacker who has merely requested an invite can read journey content, team structure, and associated data via the `adminJourney` query.

## Problem Statement

The `read()` function at `apis/api-journeys-modern/src/schema/journey/journey.acl.ts:173-182`:

```typescript
function read(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (userJourney) => userJourney.userId === user.id
  )
  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )
  return userTeam != null || userJourney != null  // ← BUG: doesn't check role
}
```

The comment on line 172 says *"team managers/members and journeys owners/editors can read the journey"* — but the implementation accepts **any** `userJourney` record, including `inviteRequested`.

This creates a "half-authorized" state:

| Query | Permission Check | `inviteRequested` Result |
|-------|-----------------|--------------------------|
| SSR `adminJourney` | `Action.Read` via `journeyAcl` | **Passes** (bug) — editor shell loads |
| Plausible stats | `Action.Update` via `journeyAcl` | **Fails** — "User is not allowed to view journey" |
| `GET_STEP_BLOCKS_WITH_POSITION` | `@CaslAccessible('Block')` | **Fails silently** — returns empty array → blank canvas |
| Template family stats `addPermissionsWithNames` | `Action.Read` via `ability()` | **Passes** (bug) — leaks journey names/team data |

### Inconsistency with other access paths

`journeyReadAccessWhere()` (same file, lines 36-58) correctly filters by `UserJourneyRole.owner` and `UserJourneyRole.editor` only. This means:
- The `adminJourneys` **list** query excludes `inviteRequested` journeys (user can't see it in the list)
- But the `adminJourney` **singular** query via direct URL lets them in

The legacy API (`apis/api-journeys/src/app/modules/journey/journey.acl.ts`) also correctly restricts Read to `owner` and `editor` via CASL rules.

### Historical context

Git archaeology reveals this is an **original oversight from May 2025** (commit `9affa5444f` by Mike Allison), not a regression. When the modern API was written to replace the CASL-based legacy API, the implicit default-deny behavior of CASL was lost. The `read()` function used a simplified null check, while `update()`, `manage()`, and `extract()` were written with explicit role checks. The `journeyReadAccessWhere()` function was added 10 months later (March 2026, commit `c7b0e96c06`) and correctly checks roles — confirming the intent was always to restrict by specific roles.

## Proposed Solution

Fix the `read()` function to check for specific allowed roles on **both** the journey and team paths, matching the pattern already used by `update()` and consistent with `journeyReadAccessWhere()`.

### Change 1: Fix `read()` in modern API journey ACL

**File:** `apis/api-journeys-modern/src/schema/journey/journey.acl.ts:173-182`

```typescript
// Before (buggy):
function read(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (userJourney) => userJourney.userId === user.id
  )
  const userTeam = journey?.team?.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )
  return userTeam != null || userJourney != null
}

// After (fixed):
function read(journey: Partial<Journey>, user: User): boolean {
  const userJourney = journey?.userJourneys?.find(
    (uj) => uj.userId === user.id
  )
  const userTeam = journey?.team?.userTeams.find(
    (ut) => ut.userId === user.id
  )
  const hasJourneyReadAccess =
    userJourney?.role === UserJourneyRole.owner ||
    userJourney?.role === UserJourneyRole.editor
  const hasTeamReadAccess =
    userTeam?.role === UserTeamRole.manager ||
    userTeam?.role === UserTeamRole.member
  return hasJourneyReadAccess || hasTeamReadAccess
}
```

This mirrors the exact pattern from `update()` (lines 186-199) in the same file.

#### Research Insights

**Why explicit team role checks too (defense-in-depth):** While `UserTeamRole` currently only has `manager` and `member`, the allowlist reasoning applied to the journey path should logically apply to the team path too. If a new `UserTeamRole` value is ever added (e.g., `pending` or `viewer`), the old `userTeam != null` check would silently grant read access. Every other function in this file (`update()`, `create()`, `manage()`, `extract()`) already checks explicit team roles. This was a consensus recommendation from the security, architecture, pattern, and TypeScript reviewers.

**Why rename callback params from `userJourney`/`userTeam` to `uj`/`ut`:** The current code shadows the outer variable name inside the `.find()` callback. While not a bug (the outer variable is not referenced inside the callback), it is a readability concern in security-sensitive code. Short callback params are sufficient here since context is obvious.

### Change 2: Add `inviteRequested` test fixture and cases

**File:** `apis/api-journeys-modern/src/schema/journey/journey.acl.spec.ts`

Add a new fixture alongside the existing ones (after line 50):

```typescript
const journeyUserJourneyInviteRequested = {
  id: 'journeyId',
  userJourneys: [
    {
      userId: user.id,
      role: UserJourneyRole.inviteRequested
    }
  ],
  team: { userTeams: [] }
} as unknown as Journey
```

Add test cases in each describe block:

```typescript
// In describe('read'):
it('denies when user has inviteRequested role', () => {
  expect(can(Action.Read, journeyUserJourneyInviteRequested, user)).toBe(false)
})

// In describe('update'):
it('denies when user has inviteRequested role', () => {
  expect(can(Action.Update, journeyUserJourneyInviteRequested, user)).toBe(false)
})

// In describe('manage'):
it('denies when user has inviteRequested role', () => {
  expect(can(Action.Manage, journeyUserJourneyInviteRequested, user)).toBe(false)
})

// In describe('delete'):
it('denies when user has inviteRequested role', () => {
  expect(can(Action.Delete, journeyUserJourneyInviteRequested, user)).toBe(false)
})

// In describe('export'):
it('denies when user has inviteRequested role', () => {
  expect(can(Action.Export, journeyUserJourneyInviteRequested, user)).toBe(false)
})
```

#### Research Insights

**Why test all 5 actions, not just `read`:** The `read` action is the only one with the bug, but since this is a security-sensitive authorization module, testing all actions provides a regression safety net. The `inviteRequested` role should be denied across the board — making this explicit in tests prevents future changes from accidentally granting access. The cost is minimal (5 one-line assertions sharing one fixture).

## Technical Considerations

### Impact analysis

- **Primary caller:** `adminJourney` query in `apis/api-journeys-modern/src/schema/journey/adminJourney.query.ts:41` — uses `journeyAcl(Action.Read, ...)`
- **Secondary caller:** `addPermissionsWithNames` in `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/addPermissionsWithNames.ts:55-59` — uses `ability(Action.Read, ...)` which routes through `journeyAcl`
- All other `journeyAcl` consumers use `Action.Update` or `Action.Manage`, which already correctly exclude `inviteRequested`
- The `ability()` wrapper in `apis/api-journeys-modern/src/lib/auth/ability.ts` delegates directly to `journeyAcl` — no additional logic to consider

### Edge case: team member with `inviteRequested` journey role

A user could be a team member (via `userTeam`) AND have an `inviteRequested` `userJourney` record. After this fix, they still get access via the `hasTeamReadAccess` path — which is correct. Team membership independently grants read access regardless of the journey-level role.

### User experience after fix

When an `inviteRequested` user navigates to `/journeys/{journeyId}`:
1. `adminJourney` query returns FORBIDDEN error
2. Frontend catches `'user is not allowed to view journey'` at `pages/journeys/[journeyId].tsx:178`
3. `AccessDenied` component renders with "Request Access" messaging
4. This is the **existing intended UX** — no frontend changes needed

### Security posture

The fix uses an **allowlist** approach (explicitly checking for `owner`/`editor` on journeys and `manager`/`member` on teams) rather than a denylist. Any future role additions to either enum would be denied by default — correct security posture consistent with `journeyReadAccessWhere()`.

### Codebase-wide ACL audit

All 19 ACL files in the codebase were audited for the same bug pattern (`!= null` without role check). **Only this one instance exists.** All legacy API ACL files use CASL's declarative rules which enforce role checks structurally. The modern API's `journeyCollection.acl.ts` correctly checks roles. No other files need changes.

### Performance impact

**Zero measurable impact.** The fix replaces two null checks with four string equality comparisons on in-memory objects. The `update()` function already performs this exact same pattern. Request latency is dominated by the Prisma query (database round trip), not the ACL computation.

### Future improvement: shared role constants

To prevent future drift between `journeyReadAccessWhere()` (Prisma filter) and `read()` (runtime check), consider extracting shared role constants:

```typescript
// journey.acl.roles.ts - single source of truth
export const JOURNEY_READ_ROLES = {
  userJourney: [UserJourneyRole.owner, UserJourneyRole.editor] as const,
  userTeam: [UserTeamRole.manager, UserTeamRole.member] as const,
}
```

This is out of scope for this fix but would eliminate the class of bug where these two functions disagree. Both functions would import and use these constants.

## Acceptance Criteria

- [ ] `inviteRequested` users receive FORBIDDEN when querying `adminJourney`
- [ ] `inviteRequested` users see the `AccessDenied` component, not a broken editor
- [ ] `owner` and `editor` journey roles continue to have Read access (no regression)
- [ ] Team `manager` and `member` roles continue to have Read access (no regression)
- [ ] Published templates remain readable by all users (no regression)
- [ ] User with both team membership AND `inviteRequested` journey role still has access via team path
- [ ] All new test cases pass
- [ ] Existing test suite passes without modification (except new additions)

## Files to Modify

1. `apis/api-journeys-modern/src/schema/journey/journey.acl.ts` — Fix `read()` function (line 182)
2. `apis/api-journeys-modern/src/schema/journey/journey.acl.spec.ts` — Add `inviteRequested` fixture and test cases

## Sources & References

- Modern API journey ACL: `apis/api-journeys-modern/src/schema/journey/journey.acl.ts:173-182`
- Modern API journey ACL tests: `apis/api-journeys-modern/src/schema/journey/journey.acl.spec.ts`
- Legacy API journey ACL (correct implementation): `apis/api-journeys/src/app/modules/journey/journey.acl.ts:73-80`
- `journeyReadAccessWhere` (correct implementation): `apis/api-journeys-modern/src/schema/journey/journey.acl.ts:36-58`
- `adminJourney` query (Read caller): `apis/api-journeys-modern/src/schema/journey/adminJourney.query.ts:41`
- `addPermissionsWithNames` (Read caller): `apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/addPermissionsWithNames.ts:55-59`
- Frontend error handler: `apps/journeys-admin/pages/journeys/[journeyId].tsx:178`
- Block ACL: `apis/api-journeys/src/app/modules/block/block.acl.ts:27-39`
- Original bug introduction: commit `9affa5444f` (2025-05-27)
- `journeyReadAccessWhere` addition: commit `c7b0e96c06` (2026-03-11)
