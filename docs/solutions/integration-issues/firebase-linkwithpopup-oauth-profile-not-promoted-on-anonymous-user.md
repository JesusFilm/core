---
title: Guest-to-Google conversion drops display name and avatar on linkWithPopup
category: integration-issues
date: 2026-04-24
tags:
  - firebase-auth
  - linkWithPopup
  - anonymous-user
  - oauth
  - google-sign-in
  - jwt-refresh
  - provider-data
  - profile-sync
  - nextjs
  - graphql
problem_type: integration_issue
severity: high
nes_ticket: NES-1593
pr: 9066
---

## Problem

When a guest (anonymous Firebase) user signs up by linking a Google account via `linkWithPopup`, their Google display name and avatar are dropped. The user appears as `"Unknown User"` with a blank avatar in the top-nav, journey editor owner chips, team member rows, and any surface that reads `User.firstName`/`User.imageUrl` from `api-users`.

### Symptoms

- After completing the Google OAuth popup, the UI renders the identity as `"Unknown User"` with no avatar.
- `firebase/auth` `currentUser.displayName` and `currentUser.photoURL` are `null` immediately after `linkWithPopup(GoogleAuthProvider)` resolves — even though `providerData[0]` contains the correct Google values.
- The JWT sent to `api-users` has empty `name` / `picture` claims, so the DB row for the converted user never picks up the profile.
- A hard refresh sometimes "self-heals" the avatar, but the first render after conversion is always broken.
- Three earlier fix attempts each closed part of the gap but none were sufficient alone.

### Affected surfaces

- `journeys-admin` top-nav user menu (avatar + display name)
- Journey editor "owner" / "last edited by" chips
- Team member list rows for the newly-converted user
- Any downstream GraphQL `User.imageUrl` / `firstName` / `lastName` reads against `api-users` immediately after conversion

### Environment

- Firebase JS SDK v10 modular (`firebase/auth`) on Next.js client
- `firebase-admin` on Yoga/Pothos backend (`api-users`)
- ID token claims cached client-side; auto-refresh only on expiry
- Shared Firebase helpers in `libs/yoga/src/firebaseClient`

## Root Cause

After `linkWithPopup` merges a Google provider into an anonymous Firebase user, the resulting user record has `displayName` and `photoURL` as `null` at the top level — **the profile data lives only inside `providerData[]`**. Firebase Auth does not auto-hoist provider profile fields onto the root user record during `linkWithPopup` (unlike `signInWithPopup` on a fresh user). Consequently the ID token's `name`/`picture` claims are empty, and any downstream sync that reads `user.displayName` / `user.photoURL` (whether in the client SDK or the Admin SDK via `auth.getUser()`) sees `null`.

## Investigation Steps Tried

- **Server-only sync on `emailVerified` transition** (commit `3d669a5a7`) — added logic in `findOrFetchUser.ts` to mirror `auth.getUser(uid).displayName`/`photoURL` into the DB when `emailVerified` flipped `false → true`. **Failed**: the Admin SDK `UserRecord`'s top-level fields are themselves `null` on a linked anonymous user, so the server read nothing.
- **Force-refresh the JWT client-side** (commit `26eca2722`) — switched `getIdToken()` to `getIdToken(true)` in `loginWithCredential` and `SignInServiceButton`. **Failed**: `name`/`picture` claims are derived from the user record's top-level fields, which remain `null` — refreshing a token cannot surface data that doesn't exist on the record.
- **Implicit reliance on Firebase auto-population** — assumed `linkWithPopup` would behave like `signInWithPopup` and hoist provider profile to the root. **Failed**: that auto-hoist only happens on first-time sign-in via `signInWithPopup`, not when linking to an existing (anonymous) account.

## Working Solution

Two layers — a client-side hoist so the very first request after conversion carries correct claims, plus a server-side `providerData[]` fallback for any future path that forgets the hoist.

### Client — promote providerData to top-level + force-refresh before Apollo mutations

`apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx`:

```ts
const userCredential = await linkWithPopup(currentUser, authProvider)
const user = userCredential.user

// linkWithPopup does not promote the provider's displayName/photoURL onto
// the top-level Firebase user, so the next ID token refresh would be
// missing the name/picture claims. Copy them from providerData.
try {
  const linkedProvider = user.providerData?.find((p) => p.providerId === authProvider.providerId)
  const profileUpdates: { displayName?: string; photoURL?: string } = {}
  if (user.displayName == null && linkedProvider?.displayName != null) {
    profileUpdates.displayName = linkedProvider.displayName
  }
  if (user.photoURL == null && linkedProvider?.photoURL != null) {
    profileUpdates.photoURL = linkedProvider.photoURL
  }
  if (Object.keys(profileUpdates).length > 0) {
    await updateProfile(user, profileUpdates)
    await user.reload()
  }
} catch (error) {
  console.warn('failed to promote provider profile after link', error)
}

// Force-refresh once so the new claims are in the token Apollo attaches to
// journeyPublish and that /api/login exchanges for the session cookie.
const idToken = await user.getIdToken(true)
```

**Ordering is load-bearing.** Apollo's auth link (`apps/journeys-admin/src/libs/apolloClient/apolloClient.ts`) calls `getAuth().currentUser.getIdToken()` without a force flag — it reads the cached token. The `getIdToken(true)` call must happen **before** any downstream mutation (`journeyPublish`) or session-cookie exchange (`/api/login`), or the mutation ships with the stale anonymous JWT.

### Server — providerData fallback + sanitization

`apis/api-users/src/schema/user/findOrFetchUser.ts`:

```ts
function resolveProviderProfile(firebaseUser: UserRecord): {
  displayName: string | null
  photoURL: string | null
} {
  const linked = firebaseUser.providerData?.find((p) => p.providerId !== 'firebase')
  return {
    displayName: sanitizeDisplayName(firebaseUser.displayName ?? linked?.displayName),
    photoURL: sanitizePhotoURL(firebaseUser.photoURL ?? linked?.photoURL)
  }
}
```

Shared helpers in `libs/yoga/src/firebaseClient/firebaseClient.ts`:

- `sanitizeDisplayName` — strips `\p{C}` control chars, trims, caps at 100 chars
- `sanitizePhotoURL` — requires `https:` scheme, caps at 2048 chars, returns `null` for anything else
- `splitDisplayName` — returns `null` for empty input so callers decide fallback (`'Unknown User'` for create paths) vs preserve-existing (update paths)

### Why both layers

The client fix makes conversion complete in a single round-trip — the first `journeyPublish` after conversion already carries `name`/`picture` claims, so users never hit a window where their profile appears blank. But relying on the client alone is fragile: it assumes every OAuth provider (Facebook, Apple, Okta, SAML) exposes `displayName`/`photoURL` in `providerData[]` with the same shape, and it assumes every client entry point (not just `SignInServiceButton`) remembers to run the hoist. The server-side `resolveProviderProfile` fallback guarantees correctness even if a new client path forgets the hoist, a provider's SDK behaves differently, or a future Firebase SDK change alters `updateProfile` semantics.

## Prevention

- **Treat top-level Firebase profile fields as "best effort".** After `linkWithPopup` / `linkWithCredential`, `user.displayName` / `user.photoURL` are not populated from the newly linked IdP — only `providerData[i]` for that IdP holds the fresh values. Always inspect `providerData[]` as the source of truth.
- **Force-refresh exactly once, as early as possible** after any profile mutation (`updateProfile`, `linkWithPopup`, `unlink`). Every downstream consumer reads the cached token, so a late or missing refresh silently ships stale claims.
- **Never trust cached ID tokens across a profile change.** If you mutate `displayName`/`photoURL` on the client, the previously cached JWT is now a lie — invalidate it before any network call that relies on those claims.
- **Mirror the providerData fallback on the server.** `admin.auth().getUser(uid).displayName` inherits the same emptiness as the client top-level field — always fall through to `userRecord.providerData[]` when top-level is null before writing to the DB.
- **Sanitize every IdP-sourced string before persistence** — strip control chars, cap length, validate URL scheme. Critical for configurable IdPs (Okta, custom OIDC) where the tenant controls the claim contents.
- **Prefer one shared helper module** for split/sanitize. Inlining logic in auth flows guarantees drift — one caller will forget a scheme check.

## Testing Checklist

- Reproduce from a fresh incognito window with Firebase IndexedDB persistence cleared — warm sessions hide the bug.
- Decode the ID token after `getIdToken(true)` and confirm `name` and `picture` claims are present and correct.
- Assert `ctx.currentUser.firstName !== 'Unknown User'` in the server resolver after conversion. `'Unknown User'` is the sentinel meaning "JWT arrived with no name claim".
- Exercise every supported OAuth provider: Google, Facebook, Apple, Okta — each returns profile claims in subtly different shapes.
- Test a single-token `displayName` (no space) — `splitDisplayName` must not produce an empty `lastName` that overwrites a good existing value.
- Test a provider that returns NO `displayName` — the conversion MUST preserve existing `firstName`/`lastName`, not blank to `'Unknown User'`.
- Test attacker-controlled `photoURL`: `data:text/html,...`, `javascript:alert(1)`, an 10 KB URL, a malformed URL. All must be rejected by `sanitizePhotoURL`.

## Code Patterns to Re-use

- `libs/yoga/src/firebaseClient/firebaseClient.ts` — `splitDisplayName`, `sanitizeDisplayName`, `sanitizePhotoURL`. Import these anywhere provider-sourced profile data crosses into the DB layer; do not reimplement.
- `apis/api-users/src/schema/user/findOrFetchUser.ts::resolveProviderProfile` — canonical shape for deriving a profile from a Firebase `UserRecord` with `providerData[]` fallback. Mirror this in any new resolver that reads Firebase user records.

## Related

- [docs/plans/2026-04-23-001-fix-guest-google-profile-sync-plan.md](../../plans/2026-04-23-001-fix-guest-google-profile-sync-plan.md) — original plan for NES-1593. Complements this doc; the plan's stated root cause (stale anonymous JWT) was partially correct but missed the `linkWithPopup`-doesn't-promote-providerData insight captured here.
- [docs/plans/2026-04-07-001-fix-google-sync-dropdown-userid-mismatch-plan.md](../../plans/2026-04-07-001-fix-google-sync-dropdown-userid-mismatch-plan.md) — NES-1492, Firebase UID vs Prisma UUID federation. Same `api-users` / `findOrFetchUser` surface.
- [docs/solutions/security-issues/google-sync-missing-integration-ownership-guard.md](../security-issues/google-sync-missing-integration-ownership-guard.md) — tangentially related, touches federation identity.
- PR [#9066](https://github.com/JesusFilm/core/pull/9066) — this fix
- PR [#8945](https://github.com/JesusFilm/core/pull/8945) — `fix: login after guest flow` (precedent for guest-auth work)
- PR [#8717](https://github.com/JesusFilm/core/pull/8717) — `feat: guest user merge` (original guest-merge feature)
