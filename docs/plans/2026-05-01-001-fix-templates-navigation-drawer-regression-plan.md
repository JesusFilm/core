---
title: 'fix: Restore navigation drawer visibility on /templates for signed-in users (NES-1432 regression)'
type: fix
status: active
date: 2026-05-01
---

# fix: Restore navigation drawer visibility on /templates for signed-in users (NES-1432 regression)

## Summary

The `/templates` page hides the side navigation drawer for signed-in users because the page is rendered statically (`getStaticProps`) and never serializes the auth user into `pageProps`. Convert the page to `getServerSideProps` so the user is hydrated synchronously, matching every other authenticated page (`/`, `/journeys/[journeyId]`, `/templates/[journeyId]`, etc.). This eliminates the client-side Firebase race that the previous fix relied on, while keeping unauthenticated browsing intact.

---

## Problem Frame

NES-1432 was originally fixed by PR #8873 (commit `4bf92a2ec`, merged 2026-03-19): `AuthProvider` started subscribing to Firebase `onAuthStateChanged` and falling back to a client-resolved user when `serverUser` was `null`. Sharon QA-passed it on PR preview and prod on 2026-03-19/20.

The bug has now re-appeared: signed-in users navigating to **Templates Library** see the side navigation drawer disappear; it only reappears after they open an individual template or return to **Projects**.

The previous fix is still in `apps/journeys-admin/src/libs/auth/AuthProvider.tsx` and unchanged. The regression therefore comes from outside that file. Most plausible contributors:

- **Firebase v9 → v10 upgrade** (commit `a8d7e1b05`, 2026-03-24, *after* the QA pass). Firebase 10 changed initialization timing in some environments; on cold load or fast client-side navigation the `onAuthStateChanged` callback can fire later than the templates page's first paint.
- The `/templates` page uses `getStaticProps`, so `pageProps.userSerialized` is never set. The page is the **only authenticated-aware page in the app that does not serialize the user server-side** — the previous fix masked this by relying on Firebase resolving on the client before the user notices. Any change that delays Firebase resolution (v10 upgrade, network latency, cookie/IndexedDB state) re-exposes the gap.

The fix restores deterministic behavior by removing the dependency on Firebase client-side timing for the navbar.

---

## Requirements

- R1. When a signed-in user navigates to `/templates` (client-side or direct URL load), the side navigation drawer is visible from the first paint and stays visible.
- R2. When a signed-out user opens `/templates`, the side navigation drawer is **not** visible (preserve the existing public-browsing behavior — see ticket QA step 2).
- R3. The templates gallery data (languages, tags, journeys, template language IDs) continues to load on initial render — no regression to gallery rendering.
- R4. The page continues to redirect unverified signed-in users to `/users/verify?redirect=/templates` (preserve existing email-verification redirect).
- R5. The `JOURNEY_NOT_FOUND_ERROR` query-param snackbar flow keeps working (preserve existing behavior in the page component).
- R6. Auth-dependent providers (LaunchDarkly flags, Apollo client token) receive the correct user / token on `/templates`, matching the other server-rendered authenticated pages.

---

## Scope Boundaries

- Do not modify `AuthProvider.tsx` — its Firebase fallback remains useful for any future `getStaticProps` page and is also exercised by the existing test suite.
- Do not change the gallery data-fetching shape (`GET_JOURNEY_TEMPLATE_LANGUAGE_IDS`, `GET_LANGUAGES`, `GET_TAGS`, `GET_JOURNEYS`). Reuse the existing query sequence.
- Do not change `PageWrapper`, `NavigationDrawer`, or the AppHeader components.
- Do not investigate or roll back the Firebase v10 upgrade — out of scope here even if it is the proximate trigger.

### Deferred to Follow-Up Work

- Re-evaluating whether other `getStaticProps`-based pages exist that depend on `useAuth()` for layout decisions (none currently identified, but worth a sweep): not blocking this fix.

---

## Context & Research

### Relevant Code and Patterns

- `apps/journeys-admin/pages/templates/index.tsx` — current `getStaticProps` implementation; the page that needs to change.
- `apps/journeys-admin/pages/templates/[journeyId].tsx` — the canonical pattern for a templates page that supports both signed-in and signed-out users via `getServerSideProps`. Uses `getAuthTokens`, falls back to `null` user when tokens are missing, passes `allowGuest: true` to `initAndAuthApp`, and serializes `userSerialized: user != null ? JSON.stringify(user) : null`.
- `apps/journeys-admin/pages/index.tsx` — server-rendered home page (uses `redirectToLogin` for unauthenticated users; we **do not** want that here, since `/templates` is publicly browsable).
- `apps/journeys-admin/src/libs/auth/getAuthTokens.ts` — `getAuthTokens` and `toUser` helpers used by every `getServerSideProps` flow.
- `apps/journeys-admin/src/libs/initAndAuthApp/initAndAuthApp.ts` — accepts an optional `user` prop and an `allowGuest` flag; returns `apolloClient`, `flags`, `redirect`, and `translations`. Already used by `/templates/[journeyId]`.
- `apps/journeys-admin/pages/_app.tsx` — reads `pageProps.userSerialized`, parses it, passes it to `AuthProvider` and uses `user?.token` to seed the Apollo client.
- `apps/journeys-admin/src/libs/auth/AuthProvider.tsx` — current Firebase fallback; preserved.

### Institutional Learnings

- The `_app.tsx` pattern wires `userSerialized` → `AuthProvider.user` → `useAuth()`. Every authenticated page in this app serializes the user this way; `/templates/index.tsx` was the lone exception because it predates the auth-aware navbar and was originally a fully public page.

### External References

- `next-firebase-auth-edge` cookie-based auth: `getTokensFromObject` reads the same cookie the middleware sets, and works inside `getServerSideProps`. No additional config needed; the existing `authConfig` already covers it.

---

## Key Technical Decisions

- **Convert `getStaticProps` → `getServerSideProps`**: makes auth state authoritative server-side, removes the Firebase client-side race entirely, and aligns `/templates` with the rest of the authenticated app. The page already revalidates every 60 s, so its content is not truly static; the perf trade-off is small and the bug elimination is large.
- **Allow unauthenticated access**: do not call `redirectToLogin` when tokens are missing. Mirror `pages/templates/[journeyId].tsx`: `const user = tokens != null ? toUser(tokens) : null` and pass `allowGuest: true` to `initAndAuthApp`.
- **Serialize user conditionally**: `userSerialized: user != null ? JSON.stringify(user) : null` — match the `[journeyId]` page exactly so `_app.tsx` parses it correctly for both signed-in and signed-out cases.
- **Honor `redirect` from `initAndAuthApp`**: if `initAndAuthApp` returns a redirect (e.g. unverified email, conditional redirect), forward it. This replaces the in-component `router.push('/users/verify?redirect=/templates')` for the SSR path. Keep the in-component `router.push` for the client-side `GetMe` query path so behavior is preserved if the Apollo cache rehydrates with stale data.
- **Drop `revalidate: 60`**: not applicable to `getServerSideProps`. Acceptable: every request rebuilds the page from the apollo client / Launch Darkly. This matches `/`, `/publisher/[journeyId]`, and `/journeys/[journeyId]`.

---

## Open Questions

### Resolved During Planning

- *Do we need to keep `getStaticProps` for SEO?* — No. `/templates` is behind a sign-in flow for editing and behind public browsing for guests; the gallery is not optimized as a discoverable SEO surface. The `[journeyId]` page (which is the actual marketed template page) already uses `getServerSideProps`.
- *Should we remove the in-component email-verification redirect after adding it to SSR?* — Keep both. The SSR path covers initial loads; the client `GetMe` query covers the post-mutation case where `data.me.emailVerified` flips to false during a session.

### Deferred to Implementation

- Whether the existing `PageWrapper.spec.tsx` `should show NavigationDrawer when showNavBar is true and user is provided` test needs any update — likely none, since the SSR change is in the page, not the wrapper.

---

## Implementation Units

- U1. **Convert `pages/templates/index.tsx` to `getServerSideProps`**

**Goal:** Resolve the auth user server-side and serialize it into `pageProps`, so `_app.tsx`'s `AuthProvider` sees a non-null `serverUser` for signed-in visitors and the navigation drawer is visible from the first paint.

**Requirements:** R1, R2, R3, R4, R6

**Dependencies:** None.

**Files:**
- Modify: `apps/journeys-admin/pages/templates/index.tsx`
- Test: `apps/journeys-admin/pages/templates/index.spec.tsx` *(create if missing — see U2)*

**Approach:**
- Replace the `import { GetStaticProps } from 'next'` with `import { GetServerSidePropsContext } from 'next'`.
- Remove the existing `export const getStaticProps: GetStaticProps = async ({ locale }) => { ... }` export.
- Add `export const getServerSideProps = async (ctx: GetServerSidePropsContext) => { ... }` mirroring the structure of `pages/templates/[journeyId].tsx`:
  - `const tokens = await getAuthTokens(ctx)`
  - `const user = tokens != null ? toUser(tokens) : null`
  - `const { apolloClient, redirect, translations, flags } = await initAndAuthApp({ user, locale: ctx.locale, resolvedUrl: ctx.resolvedUrl, allowGuest: true })`
  - If `redirect != null` return `{ redirect }`
  - Run the existing template-language → languages/tags/journeys query sequence using the same `apolloClient` (preserving the existing query order: `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` first, then the `Promise.all` of `GET_LANGUAGES`, `GET_TAGS`, `GET_JOURNEYS`).
  - Return `{ props: { userSerialized: user != null ? JSON.stringify(user) : null, ...translations, flags, initialApolloState: apolloClient.cache.extract() } }` — note: no `revalidate`.
- Add `import { getAuthTokens, toUser } from '../../src/libs/auth/getAuthTokens'` to the page imports.
- Leave the page component body unchanged (the `useAuth()` / `userSignedIn` / `PageWrapper` props, the email-verification client-side redirect, and the JOURNEY_NOT_FOUND_ERROR snackbar are all still correct).

**Patterns to follow:**
- `apps/journeys-admin/pages/templates/[journeyId].tsx` — direct precedent: same `allowGuest: true` story, same conditional `userSerialized` serialization.
- `apps/journeys-admin/pages/journeys/[journeyId].tsx` — for `redirect` propagation from `initAndAuthApp`.

**Test scenarios:**
- Happy path: `getServerSideProps` is called with a request that has valid auth cookies → returns `userSerialized` as a JSON string of the user, returns gallery data in `initialApolloState`, returns `flags`, returns `translations`. (Covers R1, R3, R6.)
- Edge case (signed-out): `getServerSideProps` is called with no auth cookies (`getAuthTokens` returns null) → returns `userSerialized: null`, still returns gallery data, no redirect. (Covers R2, R3.)
- Error/redirect path: `initAndAuthApp` returns a `redirect` (e.g. unverified email) → `getServerSideProps` returns `{ redirect }` and does **not** continue to the data queries. (Covers R4.)
- Edge case (template language IDs empty): `GET_JOURNEY_TEMPLATE_LANGUAGE_IDS` returns empty/null → page still returns successfully with empty `ids` for the `GET_LANGUAGES` query (preserve current `console.warn` behavior). (Covers R3.)

**Verification:**
- Manual: signed-in user clicks Projects → Templates → navigation drawer remains visible across the transition. Reload `/templates` directly → navigation drawer is visible from first paint.
- Manual: log out, navigate to `/templates` directly → navigation drawer is **not** visible.
- `pageProps.userSerialized` is a non-null JSON string when the request has valid auth cookies, and `null` otherwise (verifiable via React DevTools or by inspecting `_app.tsx`'s parsed `user`).

---

- U2. **Cover the new `getServerSideProps` with a unit test**

**Goal:** Lock in the server-side auth resolution + redirect behavior so a future refactor does not silently regress NES-1432 again.

**Requirements:** R1, R2, R4

**Dependencies:** U1.

**Files:**
- Create or modify: `apps/journeys-admin/pages/templates/index.spec.tsx`

**Approach:**
- Mirror the test setup used in similar `getServerSideProps` specs in this repo. Search the repo for an existing `pages/**/*.spec.tsx` that exercises `getServerSideProps` (e.g. for `pages/index.tsx` or `pages/templates/[journeyId].tsx`) and follow that mocking pattern.
- Mock `getAuthTokens`, `toUser`, and `initAndAuthApp`. Drive the three scenarios listed in U1's test scenarios.
- The implementer should use `--no-coverage` per `.claude/rules/running-jest-tests.md`: `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/pages/templates/index.spec.tsx'`.

**Patterns to follow:**
- Whatever existing `getServerSideProps` spec the implementer locates first in `apps/journeys-admin/pages/`. Likely candidates: `pages/users/sign-in` tests or `pages/templates/[journeyId]` adjacent specs.
- `apps/journeys-admin/src/libs/auth/AuthProvider.spec.tsx` — for an example of mocking auth helpers in this app.

**Test scenarios:**
- Happy path: signed-in user → `userSerialized` is a JSON string, no redirect.
- Edge case: signed-out user → `userSerialized: null`, no redirect, gallery data still returned.
- Error path: `initAndAuthApp` returns a `redirect` → `getServerSideProps` returns the redirect and does not call the gallery queries.

**Verification:**
- All three test cases pass via `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/pages/templates/index.spec.tsx'`.

---

## System-Wide Impact

- **Interaction graph:** `_app.tsx` reads `pageProps.userSerialized` and passes it to `AuthProvider`. After this change, `/templates` will populate `userSerialized` for signed-in users, just like `/`, `/journeys/[journeyId]`, and `/templates/[journeyId]` already do. No other consumers change.
- **Error propagation:** `initAndAuthApp` may return a `redirect` (verify-email or other conditional redirect). The page must surface that as `{ redirect }` from `getServerSideProps`, matching `pages/templates/[journeyId].tsx`'s pattern.
- **State lifecycle risks:** Removing `revalidate: 60` means no SSG cache. Acceptable — the page already calls a chain of GraphQL queries on every request via Apollo, and the same is true for every other server-rendered page in the app.
- **API surface parity:** None — page-level only.
- **Integration coverage:** A unit test on `getServerSideProps` is sufficient. End-to-end coverage of the navbar visibility lives implicitly in QA (Sharon's manual scenarios).
- **Unchanged invariants:**
  - `AuthProvider` still subscribes to `onAuthStateChanged` and falls back to `clientUser` when `serverUser` is null. We are not removing the previous fix; we are reducing the surface where it has to carry the load.
  - `PageWrapper` keeps its `showNavBar`, `fadeInNavBar`, and `showAppHeader` props — the page passes them based on `userSignedIn` exactly as before.
  - The signed-out QA case (drawer not visible) continues to work because `userSerialized` is `null` for guests and `userSignedIn` is `false`.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Removing `revalidate: 60` increases per-request load on the gallery queries. | The same query set already runs on every request for `/templates/[journeyId]` and other server-rendered authenticated pages. Apollo cache and the gateway's own caching absorb most of this. Re-introduce ISR later if production load metrics show a regression. |
| `getServerSideProps` may break when the request has no `req.cookies` access (e.g. some CDN edge cases). | We use `getAuthTokens(ctx)` which already wraps `getTokensFromObject(ctx.req.cookies, authConfig)` in a try/catch returning `null` on failure. Signed-out guests already follow this path. |
| The previous fix relied on Firebase client fallback; future regressions in `getStaticProps`-style pages won't be caught by the fix here. | Out of scope. `AuthProvider`'s Firebase fallback stays in place to cover any other page that adopts `getStaticProps` later. |
| Test infrastructure for `pages/**/*.spec.tsx` may differ from the existing test for `[journeyId]`. | U2 explicitly directs the implementer to copy an existing `getServerSideProps` spec pattern from this repo before writing new mocks. |

---

## Documentation / Operational Notes

- Update Linear ticket NES-1432 with QA scenarios that explicitly cover both signed-in and signed-out flows + cold-load and client-side navigation cases (covered later by the QA-requirements step in `lfg-workflow.dev.md`).
- No infra, monitoring, or rollout changes required.

---

## Sources & References

- Linear ticket: [NES-1432 — Side navigation bar disappears on Templates Library page](https://linear.app/jesus-film-project/issue/NES-1432/side-navigation-bar-disappears-on-templates-library-page)
- Original fix PR: [JesusFilm/core#8873 — fix: ensure navigation drawer persists when pushed to template explorer](https://github.com/JesusFilm/core/pull/8873) (commit `4bf92a2ec`)
- Firebase upgrade commit (likely regression trigger): `a8d7e1b05 chore: update firebase and related dependencies to latest versions (#8899)` — Firebase v9 → v10
- Code references:
  - `apps/journeys-admin/pages/templates/index.tsx` (target of the change)
  - `apps/journeys-admin/pages/templates/[journeyId].tsx` (canonical `getServerSideProps` precedent for templates)
  - `apps/journeys-admin/pages/_app.tsx` (consumer of `userSerialized`)
  - `apps/journeys-admin/src/libs/auth/AuthProvider.tsx` (existing Firebase fallback, preserved)
  - `apps/journeys-admin/src/libs/auth/getAuthTokens.ts` (`getAuthTokens`, `toUser`)
  - `apps/journeys-admin/src/libs/initAndAuthApp/initAndAuthApp.ts` (server-side init helper)
