# WatchModern Authentication Roadmap

## Goal

- Allow anyone to experiment with text-only prompts in the WatchModern studio while keeping premium actions (image attachments and higher request volume) gated behind Google sign-in.
- Reuse the Firebase-based single sign-on pattern that already works in Videos Admin and Journeys Admin, adapting it to WatchModern's Next.js pages router and AI workflow on `/new`.

## Reference Implementations

### Videos Admin (Video Management app)

- Uses Firebase client auth helpers that force in-memory persistence so the browser never stores long-lived credentials, then launches a Google popup for the user and exchanges the resulting ID token with the backend via `/api/login`.【F:apps/videos-admin/src/libs/auth/firebase.ts†L1-L52】【F:apps/videos-admin/src/app/users/sign-in/page.tsx†L20-L88】【F:apps/videos-admin/src/app/api/index.ts†L3-L37】
- A middleware powered by `next-firebase-auth-edge` protects all non-public routes, wiring the Firebase service account, cookie serialization, and downstream GraphQL authorization check before allowing navigation.【F:apps/videos-admin/src/middleware.ts†L1-L86】【F:apps/videos-admin/src/libs/auth/config.ts†L1-L18】

### Journeys Admin (Pages router application)

- Initializes `next-firebase-auth` once in `_app` so both server and client can share Firebase configuration, cookie policy, and redirect helpers for sign-in/out routes.【F:apps/journeys-admin/pages/\_app.tsx†L1-L136】【F:apps/journeys-admin/src/libs/firebaseClient/initAuth.ts†L6-L82】
- The `/api/login` handler simply calls `setAuthCookies`, letting the package mint signed cookies after a Google popup completes on the client side.【F:apps/journeys-admin/pages/api/login.tsx†L1-L18】【F:apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx†L1-L50】

**Key takeaways for WatchModern**

1. Both apps rely on Firebase ID tokens exchanged for HTTP-only cookies, ensuring SSR requests have access to authenticated identity.
2. Videos Admin shows how to centralize route protection in middleware; Journeys Admin shows a lighter-weight approach that suits a pages-router codebase like WatchModern.
3. Client sign-in buttons simply trigger `signInWithPopup` with a Google provider configured to prompt account selection.

## Recommended Approach for WatchModern

- Start with the Journeys Admin pattern (`next-firebase-auth`) because WatchModern already uses the pages router (`pages/_app.tsx`) and needs granular gating rather than a hard redirect on every page load.【F:apps/watch-modern/pages/\_app.tsx†L1-L21】
- Keep the Videos Admin middleware in mind for future migration to the app router or for protecting API routes that must always be authenticated.

## Phased Roadmap

### Phase 1 – Firebase & Session Infrastructure

1. **Add shared Firebase config:** create `apps/watch-modern/src/libs/auth/config.ts` that mirrors the environment-driven settings from Videos Admin (`apiKey`, `authDomain`, `projectId`, `appId`, plus server-side service account keys).【F:apps/videos-admin/src/libs/auth/config.ts†L1-L18】
2. **Initialize `next-firebase-auth`:** add `src/libs/auth/initAuth.ts` and call it from `pages/_app.tsx`, following Journeys Admin's pattern so SSR and client code can read session cookies.【F:apps/journeys-admin/src/libs/firebaseClient/initAuth.ts†L6-L82】【F:apps/journeys-admin/pages/\_app.tsx†L20-L24】
3. **Implement API handlers:** add `pages/api/login.ts`, `pages/api/logout.ts`, and (optionally) `pages/api/refresh-token.ts` using the helper exports from `next-firebase-auth-edge` or `next-firebase-auth` to exchange ID tokens for cookies, mirroring the fetches already used in Videos Admin's client helper.【F:apps/videos-admin/src/app/api/index.ts†L3-L37】
4. **Expose auth context hook:** create `useAuthUser` (thin wrapper around `useUser` from `next-firebase-auth`) so feature gating in React components is ergonomic.

### Phase 2 – Client Sign-In & UX

1. **Build Google sign-in button:** reuse the pattern from Journeys Admin's `SignInServiceButton` (Google provider, popup flow, `select_account` prompt) to create a `SignInButton` component under `src/components/auth`.【F:apps/journeys-admin/src/components/SignIn/SignInServiceButton/SignInServiceButton.tsx†L18-L50】
2. **Add authentication drawer/modal:** surface the button inside WatchModern's `/new` experience so users can sign in without leaving context. `MainPromptBlock` already renders the image picker and submit actions, making it a natural insertion point for gated prompts.【F:apps/watch-modern/src/components/newPage/MainPromptBlock.tsx†L68-L200】
3. **Handle post-login redirect:** mimic Videos Admin’s `useRedirectAfterLogin` strategy so the app returns users to the prompt they were editing after successful sign-in.【F:apps/videos-admin/src/app/users/sign-in/page.tsx†L20-L88】

### Phase 3 – Feature Gating & Usage Limits

1. **Gate image attachments:** before calling `handleOpenCamera` or accepting pasted images in `MainPromptBlock`, check `authUser`. If unauthenticated, show a call-to-action modal leading to the sign-in component and block the action.【F:apps/watch-modern/src/components/newPage/MainPromptBlock.tsx†L148-L199】
2. **Track daily prompt count:** instrument the submit handler defined in `pages/new.tsx` to count completed prompt runs. Persist guest usage in a signed, short-lived cookie or local storage token, and enforce a server-side cap (e.g., via a `pages/api/prompts` handler that rejects when anonymous requests exceed five per 24 hours).【F:apps/watch-modern/pages/new.tsx†L1-L200】
3. **Enforce limits server-side:** when requests hit backend AI services, inspect the Firebase user ID from cookies; for anonymous sessions, derive a hashed device fingerprint from the guest cookie so limits cannot be bypassed with simple reloads.
4. **Upgrade attachment flows:** ensure media analysis hooks (`useImageAnalysis`, `useUnsplashMedia`) short-circuit if the user is not authenticated, guiding them to sign in before continuing.【F:apps/watch-modern/pages/new.tsx†L52-L98】

### Phase 4 – Observability & QA

1. **Add logging/analytics:** emit telemetry when users hit the limit or attempt gated actions without signing in to size demand for higher quotas.
2. **Automated tests:** add unit tests for the auth helpers and integration tests that simulate the guest prompt limit, similar to how Videos Admin verifies role checks inside middleware.【F:apps/videos-admin/src/middleware.ts†L33-L86】
3. **Document support playbook:** update PRD/README with troubleshooting steps for Firebase configuration, token refresh, and guest-limit resets.

## Open Questions & Follow-Ups

- Decide whether to share Firebase project credentials with existing apps or provision a dedicated WatchModern project to isolate quotas.
- Determine persistence for guest usage counters (signed cookies vs. backend storage keyed by anonymous token) to balance ease of implementation with abuse prevention.
- Evaluate whether certain API routes (e.g., exports, saved drafts) require the stricter `next-firebase-auth-edge` middleware later, borrowing Videos Admin’s pattern once the pages router migrates to the app router.
