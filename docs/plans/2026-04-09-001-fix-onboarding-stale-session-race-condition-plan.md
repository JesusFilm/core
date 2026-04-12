---
title: "fix: Prevent stale sessionStorage and race conditions during account onboarding"
type: fix
status: completed
date: 2026-04-09
---

# fix: Prevent stale sessionStorage and race conditions during account onboarding

## Overview

New account creation requires clearing browser cache because stale sessionStorage from a previous user session poisons the TeamProvider state, and a race condition in TermsAndConditions causes the `updateLastActiveTeamId` DB mutation and `setActiveTeam` sessionStorage write to be lost during navigation.

## Problem Frame

QA reported on NES-1482 that after the primary fix (restoring the archived onboarding journey template), users must still clear their browser cache before creating a new account. Without clearing, the T&C "Next" button either hangs or the user lands on the dashboard with no active team.

Two root causes interact:

1. **Stale sessionStorage across user sessions** -- `UserMenu.tsx` calls `logout()` which does `window.location.href = '/users/sign-in'` (full page navigation). Code after `await logout()` (including `setActiveTeam(null)`) never executes. sessionStorage retains the previous user's team ID. When a new user signs in within the same tab, `TeamProvider` reads this stale ID, can't find it in the new user's teams, and falls through to a null active team.

2. **Race condition in TermsAndConditions and TeamOnboarding** -- `updateLastActiveTeamId`, `router.push`, and `query.refetch` all run inside `Promise.allSettled`/`Promise.all`. If navigation completes first, the browser may abort the mutation. `setActiveTeam(team)` runs after the promise group, so if the page unloads during navigation, sessionStorage is never written.

## Requirements Trace

- R1. Users must be able to create a new account without clearing browser cache, even if another user was previously signed in within the same tab
- R2. After T&C acceptance, `lastActiveTeamId` must be persisted to DB before navigation
- R3. After T&C acceptance, `activeTeam` must be written to sessionStorage before navigation
- R4. TeamOnboarding must have the same sequencing guarantees as T&C
- R5. Existing onboarding tests must continue passing with the new sequencing

## Scope Boundaries

- This fix targets only the onboarding flow (T&C, TeamOnboarding) and the logout cleanup path
- Not addressing: Apollo cache contamination (not the root cause), TeamProvider general refactoring, or the archived journey detection (operational issue, already resolved)

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/src/components/TermsAndConditions/TermsAndConditions.tsx` -- race condition in `handleJourneyProfileCreate` (lines 106-127)
- `apps/journeys-admin/src/components/Team/TeamOnboarding/TeamOnboarding.tsx` -- same race in `handleSubmit` (lines 38-61)
- `apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/UserNavigation/UserMenu/UserMenu.tsx` -- logout handler (lines 104-113) where `setActiveTeam(null)` never runs
- `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx` -- sessionStorage resolution logic (lines 155-201)
- `apps/journeys-admin/src/libs/auth/firebase.ts` -- `logout()` does `window.location.href` redirect (line 48)

### Institutional Learnings

- Apollo Client `errorPolicy: 'none'` (default) discards all data when any error exists in the response. Not directly causal here but worth noting for any query changes.

## Key Technical Decisions

- **Clear sessionStorage before logout, not in TeamProvider**: Clearing in the logout handler is the most targeted fix. Adding user-change detection to TeamProvider would be more defensive but adds complexity to a shared component -- overkill for this bug.
- **Await mutations before navigation, not Promise.allSettled**: The DB write and sessionStorage write must complete before `router.push`. Fire-and-forget `query.refetch()` is acceptable since the next page will fetch fresh data anyway.
- **No TeamProvider recovery heuristic**: A "single-team auto-select" fallback was considered but rejected -- it masks bugs rather than fixing the root cause, and has edge cases with invitation-based team creation.

## Open Questions

### Resolved During Planning

- **Q: Should we clear sessionStorage in `logout()` (firebase.ts) or in UserMenu?** -- In UserMenu, before calling `logout()`. This keeps the auth module decoupled from TeamProvider's storage implementation.
- **Q: Should `query.refetch()` be awaited?** -- No, it can be fire-and-forget since the next page will do its own SSR fetch via `getServerSideProps`.

### Deferred to Implementation

- **Q: Exact error handling if `updateLastActiveTeamId` mutation fails** -- The current code in `Promise.allSettled` swallowed this. Implementation should determine whether to show a snackbar error or proceed with navigation (team will still be created, just `lastActiveTeamId` won't be set).

## Implementation Units

- [ ] **Unit 1: Clear sessionStorage on logout before navigation**

**Goal:** Ensure the previous user's team ID is removed from sessionStorage before the logout redirect fires.

**Requirements:** R1

**Dependencies:** None

**Files:**
- Modify: `apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/UserNavigation/UserMenu/UserMenu.tsx`
- Test: `apps/journeys-admin/src/components/PageWrapper/NavigationDrawer/UserNavigation/UserMenu/UserMenu.spec.tsx`

**Approach:**
Move `setActiveTeam(null)` (or equivalent sessionStorage clear) to execute BEFORE `logout()` in the logout click handler. Since `logout()` triggers `window.location.href` redirect, all code after it is dead. Reorder to:
1. `handleProfileClose()`
2. `setActiveTeam(null)` -- clears sessionStorage
3. `await client.clearStore()` -- clears Apollo cache
4. `await logout()` -- signs out and navigates away

**Patterns to follow:**
- Existing `setActiveTeam(null)` pattern already in the handler, just needs reordering

**Test scenarios:**
- Happy path: Verify `setActiveTeam(null)` is called before `logout()` in the logout handler
- Happy path: Verify `client.clearStore()` is still called during logout

**Verification:**
- sessionStorage key `journeys-admin:activeTeamId` is cleared before the page navigates to `/users/sign-in`

- [ ] **Unit 2: Fix TermsAndConditions race condition -- await mutations before navigation**

**Goal:** Ensure `updateLastActiveTeamId` completes and `setActiveTeam` writes to sessionStorage before `router.push` navigates away.

**Requirements:** R2, R3, R5

**Dependencies:** None (independent of Unit 1)

**Files:**
- Modify: `apps/journeys-admin/src/components/TermsAndConditions/TermsAndConditions.tsx`
- Test: `apps/journeys-admin/src/components/TermsAndConditions/TermsAndConditions.spec.tsx`

**Approach:**
Replace the `Promise.allSettled` block (lines 106-127) with sequential-then-parallel operations:
1. `setActiveTeam(team)` -- write to sessionStorage immediately
2. `await updateLastActiveTeamId(...)` -- persist to DB
3. `void query.refetch()` -- fire and forget
4. `await router.push(...)` -- navigate last

This ensures sessionStorage and DB are written before navigation causes a page unload.

**Patterns to follow:**
- The existing `await journeyProfileCreate()` and `await teamCreate()` calls earlier in the same function already use sequential awaits

**Test scenarios:**
- Happy path: New user accepts T&C -> profile created, team created, journey duplicated, updateLastActiveTeamId called, then navigation occurs
- Happy path: Existing user with team -> skips team creation, updateLastActiveTeamId called with existing team ID, navigates to `/`
- Happy path: Redirect query parameter preserved -> navigation goes to the redirect URL
- Edge case: User with email-only login (no displayName) -> uses email prefix as team name

**Verification:**
- `updateLastActiveTeamId` mutation completes before `router.push` is called
- `setActiveTeam` is called before navigation
- All existing tests pass with updated assertion ordering

- [ ] **Unit 3: Fix TeamOnboarding race condition -- await mutations before navigation**

**Goal:** Same sequencing fix as Unit 2, applied to the TeamOnboarding flow.

**Requirements:** R2, R3, R4, R5

**Dependencies:** None (independent of Units 1 and 2)

**Files:**
- Modify: `apps/journeys-admin/src/components/Team/TeamOnboarding/TeamOnboarding.tsx`
- Test: `apps/journeys-admin/src/components/Team/TeamOnboarding/TeamOnboarding.spec.tsx`

**Approach:**
Replace the `Promise.all` block (lines 38-61) with properly sequenced operations:
1. `await Promise.all([journeyDuplicate(...), updateLastActiveTeamId(...)])` -- these two are independent of each other, can run in parallel
2. `setActiveTeam(data.teamCreate)` -- write to sessionStorage
3. `void query.refetch()` -- fire and forget
4. `await router.push(...)` -- navigate last

Also fixes the incorrect `await router.push(...)` inside the `Promise.all` array (line 52), which evaluates the await immediately rather than as part of the promise group.

**Patterns to follow:**
- Same sequencing pattern as Unit 2

**Test scenarios:**
- Happy path: Team created -> journey duplicated and lastActiveTeamId updated in parallel -> sessionStorage set -> navigation to `/?onboarding=true`
- Happy path: Redirect query parameter preserved through team creation
- Error path: If journeyDuplicate fails, updateLastActiveTeamId should still complete (Promise.all behavior means both run)

**Verification:**
- `journeyDuplicate` and `updateLastActiveTeamId` both complete before navigation
- `setActiveTeam` is called before `router.push`
- Existing tests pass with updated sequencing

## System-Wide Impact

- **Interaction graph:** Changes touch the logout -> sign-in -> T&C -> dashboard flow. No other flows are affected.
- **Error propagation:** If `updateLastActiveTeamId` fails after being awaited (instead of silently swallowed by `Promise.allSettled`), the navigation still proceeds since the team was already created. The worst case is `lastActiveTeamId` stays null, which TeamProvider handles by selecting the first available team via the DB fallback path.
- **State lifecycle risks:** The core fix eliminates the partial-write scenario where sessionStorage and DB could be out of sync with each other and with the actual team state.
- **API surface parity:** No API changes.
- **Integration coverage:** The fix spans UserMenu (logout) -> TeamProvider (session state) -> TermsAndConditions/TeamOnboarding (onboarding mutations). Tests should verify the ordering guarantees at each point.
- **Unchanged invariants:** TeamProvider's resolution priority (URL param > sessionStorage > DB) is unchanged. The fix only ensures sessionStorage is properly cleaned between user sessions and properly written during onboarding.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Awaiting `updateLastActiveTeamId` before navigation adds latency to the T&C "Next" button | Mutation is a single DB write, typically <200ms. Acceptable tradeoff for correctness. |
| `Promise.all` for journeyDuplicate + updateLastActiveTeamId in Unit 3 means one failure rejects both | journeyDuplicate failure would throw before navigation, which is actually better than the current silent failure. The user sees the error and can retry. |

## Sources & References

- Related ticket: NES-1482 (Google account creation hangs during training)
- Related ticket: NES-1483 (Next button on T&C unresponsive)
- Closed PR: #8900 (fix: new account creation stuck on terms and conditions)
- QA comment by Sharon: "the cache must be cleared before creating an account each time"
