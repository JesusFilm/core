---
title: 'NES-1644: Template gallery preview button — revalidate cache + custom-domain gate'
type: feat
status: active
date: 2026-05-07
linear: NES-1644
parent_branch: siyangcao/nes-1539-add-template-publish-flow-and-template-gallery-page-dialog
target_branch: siyangcao/nes-1644-template-gallery-preview-button-revalidate-cache-custom
---

# NES-1644: Template gallery preview button — revalidate + custom-domain gate

## Overview

Two fixes shipping together (NES-1644 absorbed the cancelled NES-1643):

1. The "Preview" / "View the page" affordances around the Collections tab currently
   open the public URL directly. After publish the public page is ISR-cached and
   shows stale content for up to a minute. Wire those affordances through a new
   admin proxy that hits a journeys revalidate endpoint first, then redirects.
2. Custom-domain teams (`team.customDomains[].routeAllTeamJourneys === true`)
   shouldn't be allowed to publish template galleries — the public page lives at
   `your.nextstep.is/template-gallery/<slug>` only. Disable Publish + Preview on
   the affected teams with a tooltip.

Frontend-only. PR base = `siyangcao/nes-1539-add-template-publish-flow-and-template-gallery-page-dialog`
(PR #9143). Public-page revalidation can't be E2E-verified until PR #9144 lands
because the public route doesn't exist on this base.

## Scope

| Part | Files                                                                                                  |
| ---- | ------------------------------------------------------------------------------------------------------ |
| A    | `apps/journeys/pages/api/revalidate-template-gallery.ts` (new)                                         |
| B    | `apps/journeys-admin/pages/api/preview-template-gallery.ts` (new)                                      |
| C    | `CollectionCard.tsx`, `CollectionDialog.tsx` (preview pane), `CollectionPublishSuccessDialog.tsx`      |
| D    | New hook `useCanPublishCollection` + apply gate to the three surfaces. Extend `useCustomDomainsQuery`. |
| E    | Specs for parts A/B + UI tests for part D.                                                             |

## Part A — `revalidate-template-gallery.ts`

Mirror `revalidate.ts` exactly. Path is `/home/template-gallery/<slug>` —
custom domains can't publish galleries (Part D), so no `hostname` branch is
needed. Reuse `JOURNEYS_REVALIDATE_ACCESS_TOKEN` (no new env).

```ts
const path = `/home/template-gallery/${req.query.slug as string}`
await res.revalidate(path)
```

## Part B — `preview-template-gallery.ts`

Mirror `preview.ts` exactly. Same auth model (`getApiRequestTokens` + edge
cookies), same proxy semantics. The proxied URL is the new revalidate endpoint
(Part A) — so `${JOURNEYS_URL}/api/revalidate-template-gallery?…`. Final
redirect is to `${JOURNEYS_URL}/template-gallery/<slug>` (no custom-domain
branch).

## Part C — Wire Preview/View through the proxy

Three surfaces touch the public URL:

1. **CollectionCard**: no Preview menu item exists today. Add one between
   "Edit" and "Publish": label `Preview` (`Open in new tab` tooltip already in
   the dialog mirrors this) — open `/api/preview-template-gallery?slug=<slug>`
   in a new tab. Disabled when the collection is unpublished (no public URL
   exists).
2. **CollectionDialog → CollectionPreviewPane**: change `handleView` so the
   Play3Icon button opens the proxy URL instead of the raw public URL.
3. **CollectionPublishSuccessDialog**: change `handleView` to open the proxy
   URL.

The "copy link" affordances still copy the **public** URL (that's what users
share); only the in-app "open" actions go through the proxy.

## Part D — Custom-domain gate

A team has a custom domain "owning" all journeys when ANY of its
`customDomains[]` has `routeAllTeamJourneys === true`. We need this on the
admin client, but the existing `GetCustomDomains` query doesn't select
`routeAllTeamJourneys` and `useCustomDomainsQuery` skips by default in tests.
Two changes:

1. Add `routeAllTeamJourneys` to the existing `GET_CUSTOM_DOMAINS` query
   (single field add — no consumers use the unselected field name yet, see
   the search above).
2. New hook `useCanPublishCollection({ teamId })` in
   `apps/journeys-admin/src/libs/useCanPublishCollection/`:
   - Calls `useCustomDomainsQuery({ variables: { teamId }, skip: teamId == null })`.
   - Returns `{ canPublish: boolean, reason: string | null }`.
   - `canPublish === false` when any custom domain on the team has
     `routeAllTeamJourneys === true`.
   - `reason` is the verbatim copy:
     `"Teams with custom domains can't publish template galleries. Contact support if you need this."`
     — null when allowed.

Apply on each surface (Publish + Preview both gated):

- **CollectionCard**: pass `canPublishCollection` from the parent (computed
  once for the team) into the card. Wrap the Publish menuitem and the Preview
  menuitem in tooltips that render the gate copy when disabled. Empty-collection
  Publish disabling stays — if both gates apply, the gate copy wins (custom
  domain is the harder constraint).
- **CollectionDialog**: disable the dialog's preview "Open in new tab" button.
  No Publish button lives in the dialog itself today (the form's submit is
  Create/Save), so the gate only affects Preview.
- **CollectionPublishSuccessDialog**: this only opens after a successful
  publish — by definition the gate didn't apply. No change needed at the
  surface level, but to defend against a follow-up where the gate is bypassed,
  rely on the same `useCanPublishCollection` hook to disable "View the page"
  and surface the tooltip. (Belt-and-suspenders.)

The hook lives where the rest of `useCustomDomainsQuery` lives:
`apps/journeys-admin/src/libs/`. Naming matches the repo convention — searched
for existing `useCan*` hooks but found none, so this becomes the first.

NES-1637 (the next ticket up) will reuse this hook to gate other Publish
affordances. Exported via `apps/journeys-admin/src/libs/useCanPublishCollection/index.ts`.

## Part E — Tests

| File                                                                                                                                          | What                                                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/journeys/pages/api/revalidate-template-gallery.spec.ts`                                                                                 | 401 on missing/wrong token, 200 + `revalidate('/home/template-gallery/foo')`, 500 on revalidate throw.                                         |
| `apps/journeys-admin/pages/api/preview-template-gallery.spec.ts`                                                                              | 500 on missing env, 403 on missing/invalid token, 400 on missing slug, 307 to `${JOURNEYS_URL}/template-gallery/<slug>`, 500 when proxy fails. |
| `apps/journeys-admin/src/libs/useCanPublishCollection/useCanPublishCollection.spec.tsx`                                                       | `canPublish: true` on no domains / no flag / null teamId. `canPublish: false` + reason copy when any domain has `routeAllTeamJourneys`.        |
| `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionCard/CollectionCard.spec.tsx`                                           | Adds: tooltip + disabled Publish/Preview when `canPublish === false`. Preview menu item appears + opens the proxy URL when published.          |
| `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionPreviewPane/CollectionPreviewPane.spec.tsx` (new file) | Open button uses the proxy URL; disabled when canPublish is false.                                                                             |
| `apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionPublishSuccessDialog/CollectionPublishSuccessDialog.spec.tsx`           | Adds: View opens proxy URL; disabled+tooltip when canPublish is false.                                                                         |

## Open questions / assumptions

- **Assumption:** Linear ticket is unreachable (no Linear MCP, browser/web
  fetch will fail auth). The user prompt is the spec of record. Any drift
  flagged in the final report.
- **Assumption:** the verbatim tooltip copy in the prompt is final. Wrapped in
  `t(...)` for i18n parity with the rest of the surface.
- **Assumption:** the new menu item label is `Preview`, matching the existing
  Editor toolbar `PreviewItem`.
- **Decision (low-risk):** Belt-and-suspenders disable on the success dialog —
  it can never legitimately fire when `canPublish === false`, but cheap to
  guard.
- **Decision:** keep the **copy-link** affordances pointing at the public URL,
  not the proxy. Proxy is for "open in browser" actions only.

## Branch + PR

- Branch: `siyangcao/nes-1644-template-gallery-preview-button-revalidate-cache-custom`
- Base PR: `siyangcao/nes-1539-add-template-publish-flow-and-template-gallery-page-dialog`
- Assign: csiyangcao
- No external posting (Linear, Slack, etc).
