---
title: inviteRequested role bypasses journey ACL read check allowing blank editor access
category: security-issues
date: 2026-03-23
tags: [acl, authorization, journey-role, inviteRequested, userJourney, read-access, allowlist, casl-migration]
module: apis/api-journeys-modern/src/schema/journey/journey.acl.ts
symptom: Users with inviteRequested journey role could open the journey editor via direct URL but saw a blank canvas and plausible stats errors
root_cause: read() ACL function checked only for userJourney record existence (!= null) instead of validating the role value, allowing inviteRequested to pass Read checks
severity: high
time_to_resolve: 30min
related_issues: [NES-1481]
---

# inviteRequested role bypasses journey ACL read check

## Problem

Users with the `inviteRequested` journey role could open the journey editor via direct URL (`/journeys/{journeyId}`). The editor shell loaded, but they saw a **blank canvas** (no blocks rendered) and a console error: "User is not allowed to view this journey" from plausible stats queries.

This created a confusing "half-authorized" state: the page loaded but nothing inside it worked.

## Investigation Steps

1. **Searched for the error message** "User is not allowed to view this journey" — found it in plausible stats queries that check `Action.Update` via `journeyAcl`. This was the visible symptom but not the root cause.

2. **Traced the journey page load flow** — SSR fetches the journey using `Action.Read` via `journeyAcl()`, which calls the internal `read()` function.

3. **Inspected `read()` in `journey.acl.ts` (line 182)** — found it was the **only** ACL function that did not check role values. The sibling functions `update()`, `manage()`, and `extract()` all validated specific roles.

4. **Cross-referenced with `journeyReadAccessWhere()`** (Prisma-level filter in the same file, added March 2026) — this function correctly restricts to `owner`/`editor`. Confirmed the intended access policy.

5. **Cross-referenced with the legacy API** (CASL-based at `apis/api-journeys/src/app/modules/journey/journey.acl.ts`) — also correctly restricted read access by role.

6. **User confirmed their role was `inviteRequested`** — the `UserJourneyRole` enum has three values: `inviteRequested`, `editor`, `owner`. Requesting access creates a `userJourney` record with `inviteRequested`, so the `!= null` check passed.

7. **Audited all 19 ACL files** in the codebase — this was the only instance of the null-check-without-role bug.

## Root Cause

The `read()` function in `apis/api-journeys-modern/src/schema/journey/journey.acl.ts` checked only for the **existence** of `userJourney` and `userTeam` records:

```typescript
return userTeam != null || userJourney != null  // BUG
```

It did not validate the role value. Since `inviteRequested` creates a `userJourney` record, the null check passed, granting read access to users who should have been denied.

**Why it happened:** This was an original oversight from May 2025 (commit `9affa5444f`) when the modern API was ported from a CASL-based system. CASL provides implicit default-deny — unmatched roles are automatically rejected. The imperative rewrite lost that guarantee. The `read()` function used a simplified null check while `update()`, `manage()`, and `extract()` were correctly written with explicit role checks.

## Solution

**File:** `apis/api-journeys-modern/src/schema/journey/journey.acl.ts`

Replace the permissive null check with explicit role validation, matching the pattern used by sibling functions:

```typescript
// Before (buggy):
return userTeam != null || userJourney != null

// After (fixed):
const hasJourneyReadAccess =
  userJourney?.role === UserJourneyRole.owner ||
  userJourney?.role === UserJourneyRole.editor
const hasTeamReadAccess =
  userTeam?.role === UserTeamRole.manager ||
  userTeam?.role === UserTeamRole.member
return hasJourneyReadAccess || hasTeamReadAccess
```

**Tests added** (`journey.acl.spec.ts`):
- `inviteRequested` denied for all 5 actions (Read, Update, Manage, Delete, Export)
- Dual-role edge case: user with `inviteRequested` journey role + `member` team role = allowed via team path

## Key Insight

**When porting from declarative ACL (CASL) to imperative checks, every permission function must explicitly validate allowed role values — not just check for record existence.** A record existing in a junction table does not imply the user has been granted access; the record may represent a pending request.

The anti-pattern to watch for in ACL code:

```typescript
// DANGEROUS — checks existence, not authorization
return userJourney != null

// CORRECT — checks the role explicitly
return userJourney?.role === UserJourneyRole.owner ||
       userJourney?.role === UserJourneyRole.editor
```

## Prevention

1. **Test every enum value against every ACL function.** The bug survived because no test exercised `inviteRequested` against `read()`. Use a role-exhaustive test matrix.

2. **Keep enforcement paths in sync.** The Prisma filter (`journeyReadAccessWhere`) and runtime check (`read()`) must agree. Consider shared role constants:
   ```typescript
   const JOURNEY_READ_ROLES = [UserJourneyRole.owner, UserJourneyRole.editor] as const
   ```

3. **Review ACL functions for null-check-only patterns.** Any ACL function returning a boolean based solely on record existence (without checking the role) should be treated as a defect.

4. **Flag declarative-to-imperative auth rewrites as high-risk.** Require a side-by-side comparison of old rules vs new logic and a full negative-test matrix before merge.

## References

- Linear: [NES-1481](https://linear.app/jesus-film-project/issue/NES-1481/fix-inviterequested-role-bypasses-journey-read-acl)
- Plan: `docs/plans/2026-03-23-001-fix-invite-requested-role-bypasses-journey-read-acl-plan.md`
- Branch: `jianweichong/nes-1481-fix-inviterequested-role-bypasses-journey-read-acl`
- Original bug commit: `9affa5444f` (2025-05-27)
- Fix commit: `60e2bed23`
