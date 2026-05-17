---
title: 'feat(journeys-admin): NES-1608 Use Template deep link flow on admin root route'
type: feat
status: shipped
date: 2026-05-07
ticket: NES-1608
branch: siyangcao/nes-1608-use-template-deep-link-flow-on-admin-root-route
parent_branch: siyangcao/nes-1552-public-gallery-page-renderer-template-galleryslug
---

# NES-1608 — `?useTemplate=<id>` deep link flow on admin root

## Overview

The public template gallery page (NES-1552) has a "Use" button on each card that opens `https://admin.nextstep.is/?useTemplate=<journeyId>` in a new tab. Today nothing in `apps/journeys-admin` handles that query parameter — visitors land on the dashboard with the param dangling. This ticket is the admin-side receiver: when an authenticated visitor lands on `/?useTemplate=<journeyId>`, the app fetches the public template by id, opens a confirmation modal letting the user pick which team to copy the journey into, calls `journeyDuplicate`, navigates to the new journey, and strips the query param. If the visitor is unauthenticated, the existing auth redirect carries the param through sign-in and resumes the flow on return. The `?onboarding=true` popover (set when a brand-new user first lands here) is suppressed while `useTemplate` is present so the modal isn't fighting another popover for attention.

## Problem Statement / Motivation

A mission-partner shares `https://your.nextstep.is/template-gallery/easter-2026` to a leader who wants to use one of the curated templates. Today the leader clicks **Use**, lands at `admin.nextstep.is/?useTemplate=<id>` (after sign-in if needed), and sees only the empty dashboard — no acknowledgement that they came from the gallery, no template, no clear next step. They have to navigate to `/templates`, find the template again, and click _Use This Template_ from there. We're losing intent in the gap between the public and admin worlds.

## Proposed Solution

Add a thin self-contained "deep link receiver" in `apps/journeys-admin` that watches `router.query.useTemplate` on the root route and drives a confirmation modal. The modal reuses the existing `<CopyToTeamDialog>` (`@core/journeys/ui/CopyToTeamDialog`) and the existing `useJourneyDuplicateMutation` hook — no new GraphQL operations, no new mutations. The journey itself is fetched via the existing public `journey(id)` resolver using `IdType.databaseId` and `skipRoutingFilter: true` (the same pattern `pages/templates/[journeyId].tsx` already uses).

### File-level surface

| File                                                                                  | Action                                                                                                                                |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [apps/journeys-admin/pages/index.tsx](apps/journeys-admin/pages/index.tsx)            | Mount the new `UseTemplateDeepLink` component; suppress `onboarding` popover when `useTemplate` param is present.                     |
| `apps/journeys-admin/src/components/UseTemplateDeepLink/UseTemplateDeepLink.tsx`      | **New.** Hook-driven component: reads `router.query.useTemplate`, fetches journey, renders modal, handles submit + close + URL strip. |
| `apps/journeys-admin/src/components/UseTemplateDeepLink/UseTemplateDeepLink.spec.tsx` | **New.** Unit tests.                                                                                                                  |
| `apps/journeys-admin/src/components/UseTemplateDeepLink/index.ts`                     | **New.** Barrel export.                                                                                                               |

No other files change.

### Component behaviour

1. **Param detection.** Read `router.query.useTemplate`. Coerce to a string (Next.js types it as `string | string[] | undefined` — first element wins; arrays are an unusual edge but harmless to coalesce). Compute `journeyId = typeof q === 'string' ? q : Array.isArray(q) ? q[0] : undefined`. If undefined, render nothing.
2. **Fetch.** Call `useJourneyQuery({ id: journeyId, idType: IdType.databaseId, options: { skipRoutingFilter: true } })`. The `skipRoutingFilter` option lets the public-template (`status: published, template: true`) read path return the journey without enforcing journey membership ACL — exactly the same pattern used by [apps/journeys-admin/pages/templates/[journeyId].tsx:33-39](apps/journeys-admin/pages/templates/[journeyId].tsx). The hook is enabled only when `journeyId != null` (Apollo `skip`).
3. **Open dialog.** Open `<CopyToTeamDialog>` as soon as we have a `journeyId` (do not wait for the journey fetch — the dialog's submit button stays disabled while `loading || activeTeam == null || journey == null`). This means the user always gets immediate visual feedback that something is happening.
4. **Submit.** On submit (`teamId, language, showTranslation`), call `journeyDuplicate({ id: journeyId, teamId, forceNonTemplate: true })` — `forceNonTemplate: true` mirrors `CreateJourneyButton` (the same flow on the `/templates/[id]` page) so the new copy is a regular journey, not another template.
   - On success without translation: enqueue snackbar `t('Journey Copied')` (variant success), close dialog, strip param, route to `/journeys/<newId>` (matches `CreateJourneyButton` publisher path; lands the user inside the new journey instead of just bouncing them back to the journey list).
   - On success **with** translation: kick off `useJourneyAiTranslateSubscription`, hold the dialog open with progress until the subscription completes, then route. Mirrors `CreateJourneyButton`'s pattern verbatim.
   - On failure: enqueue snackbar `t('Journey duplication failed')` (variant error), keep dialog open so the user can retry on a different team.
5. **Close.** On close (X / outside-click / submit success), call `router.replace(...)` with the `useTemplate` key removed, `shallow: true` so we don't refetch `getServerSideProps`.
6. **Default team.** Pass `defaultToActiveTeam={true}` so the dropdown is pre-populated with the user's active team — consistent with NES-1601's recent "default to active team" change to `CopyToTeamDialog`.
7. **Onboarding suppression.** In `pages/index.tsx`, change the `onboarding` prop on `<TeamSelect>` from `router.query.onboarding === 'true'` to `router.query.onboarding === 'true' && router.query.useTemplate == null`. Two popovers competing for attention is bad UX, and the `useTemplate` modal is the higher-value intent for this visit.

### Auth redirect (no code change required)

`pages/index.tsx`'s `getServerSideProps` already calls `redirectToLogin(ctx)` for unauthenticated visitors, and `redirectToLogin` (in [apps/journeys-admin/src/libs/auth/getAuthTokens.ts](apps/journeys-admin/src/libs/auth/getAuthTokens.ts)) encodes `ctx.resolvedUrl` (which includes `?useTemplate=...`) into the sign-in `redirect` parameter. After login the visitor returns to `/?useTemplate=<id>` with the param intact. We will add a unit-test scenario for this path (assert the dialog opens after auth → render with the param) but no production code change is needed.

### Future extensibility

Per the architecture note on the ticket, a future "use all templates from a gallery" flow may want to re-use this surface. The implementation factors out the `journeyId` extraction and the modal mounting so that swapping the param shape (`useTemplate=<id>` → e.g. `useGallery=<slug>`) into the same component is a localised change. **MVP is single-template only** — we don't speculatively build the multi-template branching path now, but the seam is obvious: the `UseTemplateDeepLink` component owns all of "param → fetch → dialog → mutate → strip", and a sibling component could be added later without touching `pages/index.tsx`.

## Technical Considerations

### Architecture impacts

- New self-contained component in `apps/journeys-admin/src/components/`. No new app dependencies.
- Reuses existing GraphQL operations (`GetJourney`, `JourneyDuplicate`, the team list inside `TeamProvider`).
- `<TeamProvider>` is mounted globally in [apps/journeys-admin/pages/\_app.tsx:19](apps/journeys-admin/pages/_app.tsx) so `useTeam()` works inside the new component without extra wiring.
- Snackbar provider also globally mounted, so `useSnackbar()` works.

### Performance implications

- One additional `GetJourney` query when the param is present. Skipped entirely when absent. Field shape is the existing `JourneyFields` fragment (already cached if the user came from the templates index).
- The dialog is _not_ dynamically imported because once the param is present we want zero perceived latency. (For comparison, `CreateJourneyButton` does dynamic-import its dialog because it only renders on click; here we render almost immediately.) If bundle-size review pushes back, switching to `next/dynamic` is one line.

### Security considerations

- `skipRoutingFilter: true` is the existing public path used by `pages/templates/[journeyId].tsx`. The resolver still enforces `template: true && status: published` — non-templates and drafts return `null`, the dialog stays mounted with disabled submit, and the user sees an empty placeholder. We do **not** leak any data the user couldn't otherwise see at `/templates/<id>`.
- Param value is treated as opaque and only passed to the GraphQL `id` argument — no string interpolation into URLs or markup beyond `router.replace`.
- `journeyDuplicate` is server-authorised against the chosen `teamId` (the user must be a member). The dropdown only lists teams the user is in. No new attack surface.
- `forceNonTemplate: true` matches the existing flow — a non-publisher cannot create a new template via this path.

### Edge cases

| Scenario                                                   | Behaviour                                                                                                                                                                                                                                                |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useTemplate` empty string                                 | Coerce to absent → render nothing.                                                                                                                                                                                                                       |
| `useTemplate` is an unknown id                             | Resolver returns `null` → dialog stays mounted with submit disabled and a placeholder. Acceptable UX for an internal tool — the user can close and try again. (Future polish: switch to a "template not found" snackbar + auto-close. Not in MVP scope.) |
| `useTemplate` is an array (`?useTemplate=a&useTemplate=b`) | Take first element.                                                                                                                                                                                                                                      |
| User has no teams                                          | Submit stays disabled (existing dialog validation). The user is prompted to create a team via the empty dropdown's helper text.                                                                                                                          |
| Active team not yet hydrated when the param lands          | Dialog opens with submit disabled until the team list resolves. `defaultToActiveTeam` re-evaluates via `enableReinitialize` on the Formik form.                                                                                                          |
| User closes before submit                                  | Param is stripped, no journey is created.                                                                                                                                                                                                                |
| Translation enabled, then user closes mid-flight           | Existing dialog behaviour: backdrop/escape are blocked while translating, so this is impossible from the user side. The submit promise resolves on completion or error and the dialog closes itself.                                                     |
| Both `useTemplate` and `onboarding=true` present           | Onboarding popover suppressed; only the deep-link modal opens.                                                                                                                                                                                           |
| Both `useTemplate` and `type=templates` present            | Modal opens regardless of tab; `?type=templates` does not affect the deep-link flow because the page renders the modal in `mainHeaderChildren`-adjacent space (the modal is portal-rendered and tab-independent).                                        |

### Tests

Co-located spec under `UseTemplateDeepLink.spec.tsx`. Cases:

1. Renders nothing when `useTemplate` is absent.
2. Renders nothing for empty-string `useTemplate`.
3. Opens the dialog when `useTemplate` is present and journey resolves.
4. On submit with `forceNonTemplate: true`, calls `journeyDuplicate` with the right variables; on success, enqueues success snackbar, calls `router.push('/journeys/<newId>')`, and strips `useTemplate` from the URL via `router.replace` shallow.
5. On submit failure, enqueues error snackbar and leaves the dialog open with submit re-enabled.
6. On close without submit, strips `useTemplate` from the URL.
7. Passes `defaultToActiveTeam={true}` to the dialog.

A second spec on `pages/index.tsx`-level integration is not added — the index page already has an integration spec (`apps/journeys-admin/pages/index.spec.tsx` if present, otherwise the change is exercised through the component spec). Onboarding-suppression behaviour is covered as an extra case inside `UseTemplateDeepLink.spec.tsx` by asserting that, given both `useTemplate` and `onboarding=true`, the page renders the modal but the popover suppression is verified at the index level via a small assertion-style check on the prop value (a static-config-style test the project rule warns against — so we lean on the component spec instead and rely on diff review for the one-line index change).

## System-Wide Impact

- **Interaction graph.** Public gallery page emits link → middleware on admin handles host → admin `pages/index.tsx` mounts → `UseTemplateDeepLink` reads param → public `journey(id)` resolver → `<CopyToTeamDialog>` → `journeyDuplicate` mutation → admin journey appears in `GetAdminJourneys` cache (existing cache `update` in `useJourneyDuplicateMutation`) → `router.push('/journeys/<newId>')` → `pages/journeys/[journeyId]/index.tsx` (existing).
- **Error propagation.** Auth failure → existing redirect flow. Resolver `null` → empty placeholder dialog. Mutation failure → snackbar + dialog stays open. Network error during journey fetch → Apollo `error` is caught by the dialog's disabled-state branch (loading flag stays true while the query is in flight; we do not surface a network error toast in MVP).
- **State lifecycle risks.** None. All state is component-local plus `router` query. The only persistent side effect is the `journeyDuplicate` mutation, which is already an idempotent-from-the-user's-perspective flow (clicking twice creates two copies — same as the existing dialog).
- **API surface parity.** `forceNonTemplate: true` matches what `CreateJourneyButton` does in the same situation. `idType: IdType.databaseId` matches what `pages/templates/[journeyId].tsx` does. No precedent broken.

## Out of Scope

- "Use all templates from a gallery" multi-template flow (future).
- Localising the snackbar copy beyond the existing `t()` keys already in the codebase.
- Re-rendering the dashboard with the journey list pre-refreshed instead of routing into the new journey (we route into the journey because that's the user's intent — they want to start using the template).
- `/templates/<id>` route changes — the existing in-app entry point is untouched.
- Custom-domain (`[hostname]/?useTemplate=...`) handling — public galleries are intentionally only served from the root domain.

## Implementation notes (post-review revisions, 2026-05-13/14)

Shipped behaviour diverged from the original plan in a few places during CE review iterations. Captured here so the doc reflects what actually ran in production.

- **Post-success navigation target.** Plan §4 said route to `/journeys/<newId>` (matching `CreateJourneyButton`'s publisher path). Shipped behaviour routes to `/?type=journeys&refresh=true` — bouncing the user back to the journey list with a refresh flag so the new copy appears at the top. Rationale: the deep-link entry point is the dashboard, and dropping the user into a brand-new journey straight from the gallery felt jarring during review; the list-with-refresh affordance preserves the "I came from outside" mental model.
- **Strip vs nav.** Plan §5 described `router.replace` stripping the `useTemplate` key on every close path. Shipped behaviour distinguishes:
  - _Cancel / X / outside-click_ → strip param via `router.replace({ pathname, query: rest }, …, { shallow: true })`.
  - _Success (with or without translation)_ → `navigateToJourneyList()` issues `router.replace({ pathname: '/', query: { type: 'journeys', refresh: 'true' } })` and a `navigatedAwayRef` guard prevents the subsequent `handleClose` call (fired by `CopyToTeamDialog` after `submitAction` resolves) from clobbering the journey-list destination back to bare `/`.
- **Mount gating instead of Apollo skip.** Plan §2 described `useJourneyQuery(...)` enabled only via Apollo `skip`. Shipped behaviour uses an outer/inner split: the exported `UseTemplateDeepLink` returns `null` when the param is absent, and an inner `ActiveUseTemplateDeepLink` (keyed by `journeyId`) owns all hooks. Two benefits over `skip`: no `GET_JOURNEY` fires on admin loads without the deep link (the hook never instantiates), and consecutive deep-link sessions get a fresh state slate, eliminating `navigatedAwayRef` leakage across sessions.
- **Shared "active" predicate.** Plan §7 set the onboarding-suppression check to `router.query.useTemplate == null`. Shipped behaviour exports `getJourneyIdParam` from `UseTemplateDeepLink.tsx` and uses it in both places, so an empty `?useTemplate=` value treats the popover as un-suppressed and is consistent with the receiver's own mount predicate.
- **Translation-while-loading early return.** Plan §4 did not specify behaviour when a user enables translation and clicks Add before the source journey resolves. Shipped behaviour surfaces a `t('Loading template — please retry')` snackbar and **throws** from `submitAction` so `CopyToTeamDialog`'s submit pipeline halts before `updateTeamState` + `resetForm` — the user's translation toggle and language selection survive the retry.
- **Admin URL env override on the public app.** Not covered by the original plan: `apps/journeys/.../GalleryTemplateCard.tsx` reads `process.env.NEXT_PUBLIC_JOURNEYS_ADMIN_URL` inside the component body (testable via `vi.stubEnv` / `process.env` overrides) and falls back to `https://admin.nextstep.is`. `NEXT_PUBLIC_JOURNEYS_ADMIN_URL` is wired in Doppler for dev + stage; prod uses the fallback.
- **Cross-reference comments tied to a tracked ticket.** `UseTemplateDeepLink.tsx` and `libs/journeys/ui/.../CreateJourneyButton.tsx` carry mutual `TODO(NES-1680)` comments pointing at each other. Hook extraction across the duplication-and-translate orchestration was considered during review and deferred to limit shared-lib blast radius from this PR. NES-1680 is the tracked home for the extraction so the cross-reference comments are time-limited.
- **Follow-up filed.** Translation locks the dialog with no user-side cancel path while in flight (existing behaviour, also present in `CreateJourneyButton`). Tracked separately.

## Validation

- `nx type-check journeys-admin` — clean.
- `nx lint journeys-admin` — 0 new errors.
- `npx jest --config apps/journeys-admin/jest.config.ts --no-coverage 'apps/journeys-admin/src/components/UseTemplateDeepLink'` — all green.
- Manual smoke (preview deploy):
  - Logged-in visitor lands on `/?useTemplate=<known-published-template-id>` → modal opens with active team preselected, submit copies journey, navigates to `/journeys/<newId>`.
  - Logged-out visitor → redirected to sign-in, returns to the param URL, modal opens.
  - `/?useTemplate=<id>&onboarding=true` → modal opens, onboarding popover does not.
  - Close modal without submitting → URL becomes `/`, no journey created.
