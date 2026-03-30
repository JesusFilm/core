---
title: 'fix: Invitation link does not redirect to the correct team'
type: fix
status: active
date: 2026-03-25
ticket: NES-1487
---

# fix: Invitation link does not redirect to the correct team

## Overview

When a user clicks a team invitation email link (`/?activeTeam=TEAM_ID`), they land on whatever team they last had active instead of the invited team. The backend correctly generates the URL with `?activeTeam=<teamId>`, but the frontend `TeamProvider` never reads this URL parameter.

## Problem Statement

The invitation email flow generates links with `?activeTeam=TEAM_ID` (in `apis/api-journeys-modern/src/workers/email/service/service.ts:138,217`). The `TeamProvider` (`libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx`) resolves the active team using only:

1. Session storage (`journeys-admin:activeTeamId`)
2. Database (`lastActiveTeamId` on JourneyProfile)
3. Fallback to `null` (Shared With Me)

There is no step that reads the URL query parameter. The `?activeTeam` param is silently ignored.

## Proposed Solution

Add URL parameter reading to `TeamProvider`'s `updateActiveTeam` function with the highest priority:

**New resolution order:** URL param → session storage → database → null fallback

### Implementation Details

#### 1. Capture URL param at mount time (`TeamProvider.tsx`)

Follow the existing `initialSessionTeamId` pattern — capture the URL param in a `useRef` at mount time, with a `typeof window === 'undefined'` guard for SSR safety:

```typescript
// libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx

// Add constant for the URL param key
const URL_PARAM_KEY = 'activeTeam'

// Capture at mount time (alongside existing initialSessionTeamId ref)
function getUrlTeamId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    return new URLSearchParams(window.location.search).get(URL_PARAM_KEY) ?? undefined
  } catch {
    return undefined
  }
}

// Inside TeamProvider:
const initialUrlTeamId = useRef(getUrlTeamId())
```

#### 2. Add URL param as highest-priority check in `updateActiveTeam`

Insert a new block **before** the session storage check (line 135):

```typescript
function updateActiveTeam(data: GetLastActiveTeamIdAndTeams): void {
  if (activeTeam !== undefined || data.teams == null) return
  sendGTMEvent({ event: 'get_teams', teams: data.teams.length })

  // NEW: URL param takes highest priority (invitation links)
  const urlTeamId = initialUrlTeamId.current
  if (urlTeamId != null) {
    const urlTeam = data.teams.find((team) => team.id === urlTeamId)
    if (urlTeam != null) {
      setActiveTeam(urlTeam)
      syncDbAndRefetch(urlTeamId)
      cleanUrlParam()
      return
    }
    // URL team not found in teams list — fall through to session/DB
  }

  // ... existing session storage and DB logic unchanged ...
}
```

#### 3. Clean the URL parameter after consumption

Use `window.history.replaceState` (not `router.replace`) to avoid triggering a React re-render:

```typescript
function cleanUrlParam(): void {
  if (typeof window === 'undefined') return
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete(URL_PARAM_KEY)
    window.history.replaceState({}, '', url.toString())
  } catch {
    // Silently ignore — URL cleanup is best-effort
  }
}
```

This preserves other query params (e.g., `?activeTeam=X&type=templates` → `?type=templates`).

#### 4. Clear the ref after consumption

After `cleanUrlParam()`, clear the ref so refetches don't re-read a stale value:

```typescript
initialUrlTeamId.current = undefined
```

### Key Files to Modify

| File                                                                 | Change                                             |
| -------------------------------------------------------------------- | -------------------------------------------------- |
| `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx`      | Add URL param reading, priority check, and cleanup |
| `libs/journeys/ui/src/components/TeamProvider/TeamProvider.spec.tsx` | Add tests for URL param consumption                |

### Files for Reference Only (no changes needed)

| File                                                                          | Why                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `apis/api-journeys-modern/src/workers/email/service/service.ts:138,217`       | Generates `?activeTeam=` URLs — already correct                                       |
| `apps/journeys-admin/src/libs/auth/getAuthTokens.ts`                          | Auth redirect preserves `?activeTeam` via `redirect` param — already works            |
| `apis/api-journeys/src/app/modules/userTeamInvite/userTeamInvite.resolver.ts` | `userTeamInviteAcceptAll()` runs in `initAndAuthApp` before page load — already works |
| `apps/journeys-admin/pages/_app.tsx:117`                                      | `TeamProvider` wraps entire app — no change needed                                    |

## Verified Assumptions

These were investigated during research and confirmed:

- **Auth redirect chain preserves `?activeTeam`**: `redirectToLogin()` encodes the full URL into `?redirect=`, which survives sign-in, email verification (`verify.tsx`), and terms acceptance. The param arrives intact at `/?activeTeam=TEAM_ID` after auth.
- **Invitations are accepted before TeamProvider runs**: `userTeamInviteAcceptAll()` is called in `initAndAuthApp()` (server-side, during `getServerSideProps`), so by the time `TeamProvider` mounts client-side, the user already has `member` role and the team appears in the `teams` query.
- **`inviteRequested` users are filtered**: Team ACL (`team.acl.ts`) only returns teams where the user has `manager` or `member` role. Since invites are accepted before page load, this is not an issue.
- **No existing URL param cleanup pattern**: The codebase doesn't clean URL params elsewhere, so `window.history.replaceState` is the safest novel approach.

## Acceptance Criteria

- [ ] Clicking an invitation email link (`/?activeTeam=TEAM_ID`) selects the correct team
- [ ] URL param takes priority over session storage and database values
- [ ] The `?activeTeam` param is stripped from the URL after consumption (other params preserved)
- [ ] If the URL team ID doesn't match any team in the user's list, falls through to existing logic gracefully
- [ ] Works for both `teamInviteEmail` and `teamInviteAcceptedEmail` link recipients
- [ ] SSR-safe: no `window` access during server-side rendering
- [ ] Multiple tabs: URL param only affects the tab that opened the link
- [ ] Tests cover: URL param happy path, URL param with invalid team, URL param overrides session storage, no URL param (existing behavior unchanged)

## Tests

**Yes, tests are needed.** The existing `TeamProvider.spec.tsx` has thorough coverage and established patterns. Add these test cases:

### Test Cases

#### 1. `should set active team from URL activeTeam parameter`

- **Setup**: Set `window.location.search = '?activeTeam=teamId'`, mock `teams` query returning that team
- **Verify**: `activeTeam` is set to the URL-specified team, DB is synced

#### 2. `should prioritize URL param over session storage`

- **Setup**: Set both `sessionStorage` (team A) and `window.location.search` (team B)
- **Verify**: Team B (URL) wins

#### 3. `should prioritize URL param over database lastActiveTeamId`

- **Setup**: Set `lastActiveTeamId` to team A in mock query, URL param to team B
- **Verify**: Team B (URL) wins

#### 4. `should fall through to session storage when URL team is not in teams list`

- **Setup**: Set URL param to non-existent team ID, session storage to valid team
- **Verify**: Falls through to session storage team

#### 5. `should clean activeTeam param from URL after consumption`

- **Setup**: Set `window.location.search = '?activeTeam=teamId&type=templates'`
- **Verify**: `window.history.replaceState` called with URL containing only `?type=templates`

#### 6. `should not read URL param during SSR`

- **Setup**: Test with `typeof window === 'undefined'` scenario (handled by existing SSR guards)
- **Verify**: Returns `undefined`, no errors

### Test Pattern

Follow the existing pattern in `TeamProvider.spec.tsx`:

- Use `MockedProvider` with typed `MockedResponse<GetLastActiveTeamIdAndTeams>`
- Mock `window.location` via `Object.defineProperty` or jest spies
- Mock `window.history.replaceState` via `jest.spyOn`
- Use `sessionStorage.clear()` in `beforeEach`
- Render a `TestComponent` that consumes `useTeam()` and asserts on rendered output

## Dependencies & Risks

- **Low risk**: Change is confined to `TeamProvider.tsx` — a single function addition following existing patterns
- **No backend changes**: The `?activeTeam` URL generation is already correct
- **No migration**: No database or schema changes
- **Edge case**: If a user bookmarks a URL with `?activeTeam`, it will re-select that team on every visit until the param is cleaned. The `useRef` + `cleanUrlParam` approach handles this.

## Follow-up Fix: Stale Closure Race Condition (2026-03-29)

QA reported the original fix did not work on stage. Root cause: a **stale closure race condition** between `TeamProvider`'s `onCompleted` callback and `useEffect`-triggered `refetch()` calls in page components (e.g. `pages/index.tsx`).

**The race**: On mount, both `useQuery`'s `onCompleted` and the page's `useEffect` (which calls `refetch()`) invoke `updateActiveTeam`. The `refetch` captures a stale closure where `activeTeam === undefined`, bypassing the guard `if (activeTeam !== undefined) return`. By the time the refetch resolves, `initialUrlTeamId.current` has been cleared (by `onCompleted`), so it falls through to session storage and overwrites the URL team with the user's previous team.

**Fix**: Replaced the closure-based guard with a `useRef(false)` flag (`hasResolvedTeam`). Once `updateActiveTeam` runs to completion, the ref is set to `true`, preventing any stale-closure duplicate from re-running the resolution logic. This is a strict behavioral equivalent for all non-stale scenarios and fixes the race for stale ones.

## Sources

- **Linear ticket**: [NES-1487](https://linear.app/jesus-film-project/issue/NES-1487/invitation-link-does-not-redirect-to-the-correct-team)
- **Email service generating URLs**: `apis/api-journeys-modern/src/workers/email/service/service.ts:138,217`
- **TeamProvider (fix target)**: `libs/journeys/ui/src/components/TeamProvider/TeamProvider.tsx:125-157`
- **TeamProvider tests (extend)**: `libs/journeys/ui/src/components/TeamProvider/TeamProvider.spec.tsx`
- **Related ACL fix**: commit `1fcb4292` — NES-1481, ensures `inviteRequested` users can't read journeys
- **Session storage decoupling**: commit `83be338d1` — recent change to per-tab session storage
