---
title: Fix guest-to-Google profile sync (display name + avatar)
type: fix
status: active
date: 2026-04-23
---

# Fix: Guest-to-Google Profile Sync (NES-1593)

## Overview

When a guest (anonymous Firebase) user converts to an authenticated account via Google OAuth (`linkWithPopup`), their Google display name and avatar URL are not persisted to the database. The user continues to show as "Unknown User" with no avatar. Normal (non-guest) Google sign-up is unaffected.

A prior fix attempt (`3d669a5a7`) patched `findOrFetchUser.ts` and `user.ts` but did not resolve the issue in testing. This plan documents the full root cause and the complete fix required.

## Problem Statement

### Code path for normal Google sign-up (works correctly)

1. `signInWithPopup` → new Firebase UID created
2. `loginWithCredential` → `getIdToken()` → `/api/login` → session cookie
3. `me` query → `findOrFetchUser` Path A (user not in DB) → `auth.getUser(uid)` → writes `displayName`, `email`, `photoURL` ✓

### Code path for guest conversion (broken)

1. `linkWithPopup(currentUser, googleProvider)` — upgrades the same Firebase UID in-place; guest UID becomes a Google-linked UID
2. `loginWithCredential(credential)` → `credential.user.getIdToken()` **without force-refresh** → `/api/login` → session cookie set with **stale anonymous token** (no `name`, `picture`, `email` claims)
3. `window.location.reload()`
4. `me` query → `findOrFetchUser` Path C (user exists with `emailVerified: false`) → `auth.getUser(uid)` should return Google data and sync fields
5. **However**: with a stale anonymous token, `ctx.currentUser.imageUrl` / `email` / `firstName` are all `null` — the JWT-based fallback in the `me` resolver is dead code

### Why `findOrFetchUser` Path C fix also didn't take effect

Firebase Admin SDK propagation from `linkWithPopup` may have a brief delay. If the server receives the `/api/login` request and the subsequent `me` query very quickly after `linkWithPopup`, `auth.getUser(uid)` may return the pre-link anonymous state (`emailVerified: false`). In that case Path C finds `emailVerified === false` in both the DB and Firebase, does nothing, and the user stays as "Unknown User" until the next request.

### Actual root cause

**`loginWithCredential` calls `getIdToken()` without `forceRefresh: true`.**

After `linkWithPopup`, the Firebase client SDK has a fresh credential, but `getIdToken()` (no force-refresh) may return a cached anonymous token. The session cookie therefore contains claims from before the Google link. Forcing a token refresh at this point:

1. Guarantees the cookie has Google's `name`, `picture`, and `email` claims
2. Makes `ctx.currentUser` in the `me` resolver carry those values
3. Ensures the JWT-based fallback (`user.ts` lines 125–158) can write `firstName`, `email`, and `imageUrl` even if `findOrFetchUser` Path C hasn't fired yet

## Proposed Solution

### Primary fix — force token refresh after `linkWithPopup`

**`apps/journeys-admin/src/libs/auth/firebase.ts`** — `loginWithCredential`:

```typescript
// Change:
const idToken = await credential.user.getIdToken()
// To:
const idToken = await credential.user.getIdToken(true) // force-refresh post-link
```

**`apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx`** — pending-journey path (line 55):

```typescript
// Change:
const idToken = await user.getIdToken()
// To:
const idToken = await user.getIdToken(true) // force-refresh post-link
```

### Secondary fix — already in place, verify tests pass

**`apis/api-users/src/schema/user/findOrFetchUser.ts`** Path C (lines 31–63):
Syncs `displayName → firstName/lastName`, `email`, `photoURL → imageUrl` when `emailVerified` transitions `false → true`. This is now coded; tests must be confirmed passing.

**`apis/api-users/src/schema/user/user.ts`** `me` resolver fallback (lines 130–140):
Includes `imageUrl` from `ctx.currentUser.imageUrl` when email is null but JWT has Google claims. This path is only useful after the primary fix (force-refresh) so that `ctx.currentUser.imageUrl` is populated.

## Technical Considerations

### Architecture impacts

- `loginWithCredential` is called for all OAuth sign-ins (Google, Facebook, Okta). Force-refresh applies to all three — acceptable since it's a one-time cost at sign-in.
- The force-refresh token ensures the `/api/login` cookie is set with verified identity claims, which is strictly more correct.

### Edge cases and system-wide impact

| Scenario                                                         | Behavior before fix                                                                                               | Behavior after fix                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Fresh anon user (emailVerified: false in DB) converts via Google | `findOrFetchUser` Path C runs but may not see Google data if JWT stale; Firebase Admin may have propagation delay | Force-refresh JWT has Google claims; Path C fires with correct Firebase Admin data            |
| Legacy user (emailVerified: null in DB) converts via Google      | Path B sets emailVerified: false, returns — profile NOT synced until next request                                 | Path B runs on first load (unavoidable); on second load, Path C syncs all fields. Acceptable. |
| User already converted (emailVerified: true in DB, email: null)  | JWT fallback in `me` resolver has no imageUrl                                                                     | After force-refresh, JWT has picture claim; `me` resolver fallback writes imageUrl            |
| Facebook / Okta guest conversion                                 | Same issue as Google (same `loginWithCredential` call)                                                            | Force-refresh fixes all OAuth providers                                                       |

### displayName splitting

`findOrFetchUser.ts` splits `displayName` at the last space (`nameParts.slice(0, -1).join(' ')` → firstName, `nameParts[last]` → lastName). Single-word names set only `firstName`. Names with no parts use `'Unknown User'` fallback. This is acceptable for the scope of this fix.

### photoURL lifetime

Google `photoURL` tokens expire but are periodically refreshed by Firebase Auth. Storing the URL as-is is current codebase convention (not changed by this fix).

## Acceptance Criteria

- [ ] Guest user converts to Google account → display name and avatar appear immediately on page reload (no second-request delay)
- [ ] `loginWithCredential` in `firebase.ts` uses `getIdToken(true)` (force-refresh)
- [ ] Pending-journey path in `SignInServiceButton.tsx` uses `getIdToken(true)`
- [ ] `findOrFetchUser.spec.ts` — all existing tests pass; "should update profile fields when emailVerified transitions to true" test passes
- [ ] `user.spec.ts` — "should include imageUrl in update when guest converts via Google" test passes
- [ ] Facebook and Okta guest conversion paths also benefit from force-refresh (no additional changes required)
- [ ] `SignInServiceButton.spec.tsx` tests updated/added to verify `getIdToken(true)` is called after `linkWithPopup`

## Dependencies & Risks

- **Firebase Auth client caching**: After `getIdToken(true)`, Firebase refreshes the token from the server. This adds ~200–400 ms to the sign-in flow. Acceptable for a one-time login action.
- **Race condition (Firebase Admin propagation)**: Even with force-refresh, if the server receives the `me` query before Firebase Admin propagates the link, `auth.getUser()` may momentarily return the old state. This is mitigated by the JWT-based fallback path in `user.ts` which reads Google claims directly from the token (not Firebase Admin). With force-refresh, that fallback path is now reliable.
- **Legacy users (emailVerified: null)**: Two-request delay is pre-existing and accepted. A DB migration to set remaining `null` rows to `false` would eliminate this for legacy users but is out of scope.

## Implementation Files

| File                                                                                         | Change                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `apps/journeys-admin/src/libs/auth/firebase.ts:31`                                           | `getIdToken()` → `getIdToken(true)`                                 |
| `apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx:55`   | `getIdToken()` → `getIdToken(true)`                                 |
| `apis/api-users/src/schema/user/findOrFetchUser.ts:31–63`                                    | Already fixed — verify tests pass                                   |
| `apis/api-users/src/schema/user/user.ts:130–140`                                             | Already fixed — verify tests pass                                   |
| `apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.spec.tsx` | Add test: after `linkWithPopup`, `getIdToken` is called with `true` |

## Sources & References

- Branch with prior fix: `siyangcao/nes-1593-guest-user-name-not-being-updated-when-signing-up-with`
- `findOrFetchUser.ts`: `apis/api-users/src/schema/user/findOrFetchUser.ts:31`
- `user.ts` me resolver: `apis/api-users/src/schema/user/user.ts:122`
- `firebase.ts` loginWithCredential: `apps/journeys-admin/src/libs/auth/firebase.ts:28`
- `SignInServiceButton.tsx` pending journey path: `apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx:55`
- Firebase docs: token force-refresh after account linking operations is recommended when the new credential's claims must be reflected immediately
