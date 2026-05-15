---
title: 'Template Gallery Page (Collections) frontend patterns (NES-1539)'
category: best-practices
date: 2026-05-06
last_updated: 2026-05-12
problem_type: ui_pattern
component: journeys-admin/TemplateGalleryPageList
tags:
  - apollo-client
  - cache-modify
  - cache-update-query
  - optimistic-response
  - formik
  - dnd-kit
  - clipboard
  - mutation-routing
  - tab-panel
  - flag-rollout
  - mounted-ref
  - dialog
  - postgres
  - row-locking
  - nx-monorepo
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9143'
  - 'https://github.com/JesusFilm/core/pull/9119'
  - 'https://github.com/JesusFilm/core/pull/9174'
related_tickets:
  - NES-1539
  - NES-1607
  - NES-1547
  - NES-1644
related_docs:
  - docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md
  - docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md
---

# Template Gallery Page (Collections) — frontend patterns

Compact-mode documentation. Captures the patterns that emerged across
the NES-1539 implementation and the multi-agent ce-review pass. Each
pattern is one bullet of "what / why / where to look."

## Context

PR #9143 ships the admin-side "Collections" feature: publishers group team
templates into a `TemplateGalleryPage` with metadata (creator, description,
slug, optional PDF/video embed), drag templates between collections,
publish to a public `/template-gallery/<slug>` URL. Backend (NES-1547,
PR #9119) is on the same branch but reviewed separately. The frontend
work was reviewed by 5 specialized agents; ~50 raw findings were
consolidated into 20 todos and resolved in 8 commits.

Feature lives at `apps/journeys-admin/src/components/TemplateGalleryPageList/`
behind the `teamTemplateCollection` flag. When the flag is on AND the
status filter is `active`, the gallery panel renders ABOVE (not in place
of) the legacy team-templates list — additive rollout, never destructive.

## Patterns worth keeping

### 1. List-shaped Apollo cache mutations: prefer `cache.updateQuery` over `cache.modify` with `storeFieldName`

`cache.modify` is the right hammer when you have to surgically patch a
single field. For prepending into a _list-shaped_ query result, the
substring-matching `storeFieldName.includes(...)` pattern is fragile —
Apollo's argument serialization order is not stable across versions, and
any falsy `teamId == null` falls through to "modify every variant" by
mistake.

`cache.updateQuery({ query, variables }, ...)` is more explicit, type-safe,
and idempotent. See
`apps/journeys-admin/src/libs/useTemplateGalleryPageCreateMutation/useTemplateGalleryPageCreateMutation.ts`.

```ts
update(cache, { data }) {
  if (data?.templateGalleryPageCreate == null) return
  const teamId = data.templateGalleryPageCreate.team?.id
  if (teamId == null) return
  cache.updateQuery<GetTemplateGalleryPages, GetTemplateGalleryPagesVariables>(
    { query: GET_TEMPLATE_GALLERY_PAGES, variables: { teamId } },
    (existing) => {
      if (existing == null) return existing
      if (existing.templateGalleryPages.some((p) => p.id === data.templateGalleryPageCreate.id)) return existing
      return { templateGalleryPages: [data.templateGalleryPageCreate, ...existing.templateGalleryPages] }
    }
  )
}
```

This extends Pattern 2 in the NES-1543 doc (single-entity field patches)
to lists.

### 2. Formik `enableReinitialize` + `cache-and-network` queries silently nuke user edits

If the dialog's `initialValues` come from an Apollo query running with
`cache-and-network`, any sibling refetch that updates the cached row
forces Formik to reset and overwrites the user's typing.

Fix: drop `enableReinitialize`; remount the dialog on entity change with
`key={editTarget.id}` from the parent. Conditionally mount the dialog
(don't keep it mounted with `open={...}`) so local state resets between
opens. Pattern 3 of the NES-1543 doc names this trap; this PR confirmed
it on the Collections dialog.

### 3. `mountedRef` + `guardedClose` for async dialog submits

Three forces compound: (a) `await mutation()`, (b) the dialog can be
unmounted by the parent (Escape, backdrop, parent state change) while
the await is pending, (c) post-await `helpers.setFieldError` on a dead
Formik tree throws "state update on unmounted" warnings and silently
loses errors.

```ts
const mountedRef = useRef(true)
useEffect(() => {
  // Setup MUST flip mountedRef.current = true. Under React StrictMode
  // (Next.js dev) effects run setup → cleanup → setup; a body-less setup
  // leaves the ref stuck at `false` after the second setup, breaking
  // every later post-await guard. NES-1644 hit exactly this: an unpublish
  // would never clear `busyId`, so the 3-dot menu stayed permanently
  // disabled.
  mountedRef.current = true
  return () => {
    mountedRef.current = false
  }
}, [])

// in handleSubmit, after each await:
if (!mountedRef.current) return
helpers.setFieldError(...)
enqueueSnackbar(...)
```

Pair it with a `guardedClose` that no-ops while `isSubmitting` is true so
backdrop / Escape / Cancel can't dismiss mid-mutation. See
`apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionDialog.tsx`.

The same `mountedRef` shape also guards async post-await branches inside
non-dialog hooks — see `useCollectionMutations.ts:46-52` for the
`if (mountedRef.current) setBusyId(null)` finally-block + snackbar guards
that NES-1644 wired up after the StrictMode regression. Jest tests
(`NODE_ENV=test`) do NOT trigger React's StrictMode double-invoke, so a
`<StrictMode>` wrapper around `renderHook` is a false guardrail —
the only real defense is the corrected setup-body-resets-ref pattern
itself and code review when reading any `useRef(true)` /
`useEffect(() => () => …, [])` shape.

### 4. DnD single-flight: gate START, not just END

A `dragInFlight` boolean that's only checked in `handleDragEnd` is
insufficient. The user can still pick up another card during a network
round-trip and drop it; `handleDragEnd`'s early-return swallows the drop
silently — the card flies, the overlay disappears, nothing saves.

Fix:

- Gate `handleDragStart` first: short-circuit and surface a snackbar if
  `dragInFlight`.
- Pass `dragInFlight` into `useSortable({ disabled })` on every draggable
  child, not just the droppable wrappers.
- Use the default `dropAnimation` so rejected drops snap back visually.

### 5. Cross-feature mutation gate: parent owns the busy flag, dialog reads it as `parentBusy`

DnD and dialog mutations land on the same Apollo cache. While both are
in flight you can race: `cache.updateQuery` writes from a dialog Save
followed by an `awaitRefetchQueries` from a DnD assignJourney can leave
the gallery showing the older server-side state.

Lightweight fix that avoids a global state primitive: lift the busy flag
to the parent, pass it to the dialog as `parentBusy?: boolean`. The
dialog's `handleSubmit` early-returns with a snackbar when `parentBusy`
is true; the modal backdrop already prevents the reverse race (no DnD
while a dialog is open).

### 6. Tab-revisit refetch: pass `visible` prop, don't read router state inside the panel

`@core/shared/ui/TabPanel` flips `unmount` to false once on first reveal
and never back. So `cache-and-network` won't refire on tab re-visit.
The temptation is to watch `router.query.type === 'collections'` inside
the panel — but that leaks panel implementation details into the feature.

Cleaner: the parent (`JourneyList.tsx`) already knows the active content
type. Pass `visible: boolean` into the panel; the panel runs a refetch
effect keyed on that prop. The router stays in the parent.

```ts
// parent
<TemplateGalleryPageList visible={contentType === currentContentType} />

// panel
useEffect(() => {
  if (!visible || teamId == null) return
  void journeysQuery.refetch()
  void collectionsQuery.refetch()
}, [visible, teamId])
```

### 7. Unsaved-changes guard with Formik `dirty` + a secondary `<Dialog>`

For Create/Edit dialogs that are easy to dismiss (X, Cancel, backdrop,
Escape), guard the close paths with a confirmation dialog that fires
only when `dirty === true`. Submit / Save calls `onClose()` directly
(bypassing the guard) so successful submission doesn't prompt.

```ts
const guardedClose = (): void => {
  if (isSubmitting) return
  if (dirty) {
    setDiscardConfirmOpen(true)
    return
  }
  onClose()
}
```

The discard-confirm `<Dialog>` lives in the same Formik render-prop tree
so it shares state, and its Discard button calls the parent's plain
`onClose()`.

### 8. Component decomposition: large file is a "what does this do" smell

`CollectionDialog.tsx` was 1033 lines mixing form orchestration, preview
card rendering, and a creator-image picker drawer. Three siblings —
`CollectionPreviewPane/`, `CreatorImagePickerDrawer/`,
`useCollectionMutations/` — brought the parent under 670 lines and made
each piece independently inspectable. `TemplateGalleryPageList.tsx` got
the same treatment: pure DnD wrapper components into `Droppables/` and
mutation-with-snackbar bookkeeping into `useCollectionMutations/`.

The DnD dispatch is still inline because it consumes `templateIdToCollection`
and `collectionsById` maps that live in the parent — a future extraction
to `useCollectionsDnd` would make the 5-way (source, target) dispatch
unit-testable.

### 9. Naming bridge: backend entity, UI vocabulary

Backend GraphQL: `TemplateGalleryPage`. UI everywhere: "Collection". The
divergence is intentional — the backend name is grep-stable with the
schema, the UX name matches what users expect. Document the bridge in
the feature `index.ts` so future devs can grep either direction:

```ts
// apps/journeys-admin/src/components/TemplateGalleryPageList/index.ts
// Naming bridge: the backend entity is `TemplateGalleryPage` (Pothos /
// Prisma), the UI surface is "Collection". `TemplateGalleryPageList` is
// the component name to keep grep-ability with the schema; everything
// user-facing — labels, snackbars, dialog title — uses "Collection".
```

The feature flag also got renamed from `templateGalleryPage` → `teamTemplateCollection`
mid-work; flag names follow UX vocabulary.

### 10. Flag rollout: ship the simplest version, iterate later

The first attempt at the rollout was _additive_ — render the gallery
above the legacy team-templates list when the flag is on, so users
keep archive/trash/sort. In practice it duplicated every template
twice (once in the gallery's "All Templates" pool, once in the legacy
list below) and read as a bug. The shipped behavior is the simpler
_total replacement_: when the flag is on, Templates renders only the
gallery panel.

The lesson is less "additive vs replacing" and more "new UI surfaces
need to be tested in real flows before you commit to a rollout
strategy." A flag-gated swap is reversible if you keep the old branch
in tree (we did — `JourneyListContent` is one if/return away).

### 11. Optimistic DnD with `cache.modify` for cross-entity sibling fields

Without an `optimisticResponse`, Apollo waits for the network round-trip
before re-rendering. dnd-kit's drop animation fires immediately on
release and snaps the active card back to its source position — which
visually _flashes the old order_ before the cache update lands.

For intra-collection reorder, an `optimisticResponse` is enough — the
mutation returns the full TemplateGalleryPage, the splice is computable
client-side, Apollo writes it on the same tick the drop happens.

For cross-collection moves (`templateGalleryPageAssignJourney`), the
mutation only returns the _target_ page. The source page's `templates`
field is a sibling on a different normalized entity that the response
can't update. The fix: pair the optimistic response with a
`cache.modify` in the mutation's `update` callback that trims the
moving journey ref from the source page's templates list.

```ts
await templateGalleryPageAssignJourney({
  variables: { journeyId, pageId: targetCollectionId },
  optimisticResponse: {
    /* target with the journey appended */
  },
  update: (cache) => {
    if (sourceCollection == null || sourceCollection.id === targetCollectionId) return
    const sourceCacheId = cache.identify({
      __typename: 'TemplateGalleryPage',
      id: sourceCollection.id
    })
    const movedRef = cache.identify({ __typename: 'Journey', id: templateId })
    if (sourceCacheId == null || movedRef == null) return
    cache.modify({
      id: sourceCacheId,
      fields: {
        templates(existing) {
          if (!Array.isArray(existing)) return existing
          return (existing as Reference[]).filter((ref) => ref.__ref !== movedRef)
        }
      }
    })
  }
})
```

Drop the hook's `awaitRefetchQueries: true` so the optimistic update
isn't held up by the post-mutation refetch — the user sees the new
state immediately, refetch reconciles in the background.

### 12. Clipboard copy inside modals: copy-event interception, not textarea + execCommand

`navigator.clipboard.writeText` rejects in some contexts (insecure
origin, focus trap stealing focus, missing permission). The textbook
fallback is a temp `<textarea>` + `document.execCommand('copy')`, but
that **lies** inside MUI Dialog: the focus trap yanks focus away from
the temporary textarea before the selection sticks, `execCommand`
returns `true` (it ran), and the clipboard ends up empty.

The reliable fallback is a `copy` event listener that intercepts the
system copy event and writes via `clipboardData.setData` directly. No
selection, no textarea, nothing for the focus trap to steal.

```ts
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText != null) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // fall through
    }
  }
  let copied = false
  const handler = (e: ClipboardEvent): void => {
    if (e.clipboardData == null) return
    e.clipboardData.setData('text/plain', text)
    e.preventDefault()
    copied = true
  }
  document.addEventListener('copy', handler)
  try {
    document.execCommand('copy')
    return copied
  } finally {
    document.removeEventListener('copy', handler)
  }
}
```

The shared helper lives at
`apps/journeys-admin/src/libs/copyToClipboard/`.

### 13. Display-index ordering protocol: page lock + renumber pass (backend pairs with frontend)

The backend reorder mutation initially treated its `order` arg as an
absolute `order` column value and shifted the affected window with
`SET "order" = "order" ± 1`. Two failures emerged in practice:

1. **Concurrent reorders both staged a row to `order = -1`** to avoid
   the window-shift collision. The second transaction tripped the
   `(templateGalleryPageId, order)` UNIQUE constraint.
2. **Assign/unassign produced gappy orders** (`{0, 2, 4, 5}` after
   churn) because the unassign path didn't renumber. The frontend
   sent a _display index_ (computed from the array index of the
   over-row), the resolver compared it to absolute `order` values,
   and drags through gaps silently no-op'd.

The shipped fix in `apis/api-journeys-modern/src/schema/templateGalleryPage/applyContiguousOrder.ts`:

- **`lockPage(tx, pageId)`**: `SELECT 1 FROM "TemplateGalleryPage"
WHERE id = ${pageId} FOR UPDATE`. Caller MUST be inside a
  transaction. Serializes concurrent reorder/assign mutations on the
  same page.
- **`applyContiguousOrder(tx, pageId, rowsInOrder)`**: stages every
  row in the page to a unique negative sentinel
  (`-("order") - 1000000`), then walks the input array writing each
  row's final `order = i` in `0..N-1`. Two-pass write so the per-row
  UNIQUE check on the unique index never sees a transient duplicate.
- **Reorder protocol**: read rows in display order, splice in memory
  by the display-index input, call `applyContiguousOrder`. The input
  is now _unambiguously_ a display index — the resolver never
  compares it to a stored `order`.
- **Assign/unassign**: lock both source and target pages in
  lexicographic id order (deadlock-safe), then renumber both pages
  after the membership change so orders stay contiguous.

Frontend pairs this with optimistic responses (#11) so the visible
order updates on the same tick as the drop, not after the network
round-trip.

One-off cleanup is required for any page that already has gappy data
from before the fix:

```sql
BEGIN;
UPDATE "TemplateGalleryPageTemplate"
SET "order" = -("order") - 1000000
WHERE "templateGalleryPageId" = '<page-id>';

UPDATE "TemplateGalleryPageTemplate" AS t
SET "order" = sub.new_order
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "order" ASC) - 1 AS new_order
  FROM "TemplateGalleryPageTemplate"
  WHERE "templateGalleryPageId" = '<page-id>'
    AND "order" < 0
) AS sub
WHERE t.id = sub.id;
COMMIT;
```

### 14. Revalidate-on-mutation chain for ISR-backed public pages (NES-1644)

The public template-gallery page is statically generated with
`revalidate: 60` ISR. Without an active refresh signal, the published
page would lag the admin's mutation by up to 60 s. We close that gap
with a three-layer chain:

1. **Admin mutation success path** fires a fire-and-forget call to
   `useRevalidateTemplateGallery([slug])`. Lives in
   `apps/journeys-admin/src/components/TemplateGalleryPageList/useCollectionMutations/useCollectionMutations.ts`
   (publish/unpublish/ungroup),
   `.../useCollectionForm/useCollectionForm.ts` (save), and
   `TemplateGalleryPageList.tsx` (trash-success callback, prop-drilled
   into the existing `TrashJourneyDialog`).
2. **Admin's `/api/revalidate-template-gallery`** is a Firebase-auth +
   CSRF-gated proxy that forwards to the journeys-side endpoint with
   the shared-secret token in an `Authorization: Bearer` header (NEVER
   a query param — see Pattern 15).
3. **Journeys-side `/api/revalidate-template-gallery`** validates the
   Bearer token in constant time and calls `res.revalidate(path)` to
   refresh the ISR cache for the specific slug.

Belt-and-braces: the admin's `/api/preview-template-gallery` proxy
runs an AWAITED revalidate before issuing its 307 redirect to the
public URL. The fire-and-forget mutation revalidate is the primary
signal; the awaited preview revalidate is a safety net for the
"click View immediately after publish" race.

`useRevalidateTemplateGallery` accepts an array of slugs (to cover
slug renames where both the old and new path need eviction) and
dedupes via `new Set` before `Promise.all`. Network failures are
swallowed by design — the mutation already succeeded; the public
page will catch up on the next ISR revalidation interval.

**Non-obvious invariant:** the mutation handler should NOT `await`
the revalidate. We tried that (`await revalidateGallery(...)`) once
to "fix" a hypothetical race; Siyang's 60s-wait reproduction
falsified the hypothesis and showed the real bug was elsewhere (a
dead backend at the moment of test). Awaiting just adds 200-400 ms
of latency per user-visible mutation for no correctness gain. See
the residual write-after-invalidate race noted in NES-1677's
backend cache work.

### 15. Shared-secret API auth: `Authorization: Bearer` + `timingSafeEqual`, never the URL (NES-1644)

A shared secret protects the journeys-side revalidate endpoint from
unauthenticated invocations. Two non-obvious rules:

1. **Never put the token in the URL.** Query-string tokens land in
   reverse-proxy / CDN / APM access logs, browser history, and HTTP
   Referer headers on outbound clicks. Token-in-header isolates the
   secret to the request body / connection layer where logging is
   typically off-by-default for credentials.

   `apps/journeys/pages/api/revalidate-template-gallery.ts` reads
   the token from `req.headers.authorization` (`Bearer <token>`) and
   actively REJECTS the legacy `?accessToken=...` query form with a
   distinct 401. Rejecting the legacy form closes the migration
   window where two auth paths could be live simultaneously.

2. **Compare in constant time.** Use `crypto.timingSafeEqual(buf,
   buf)` after a length-check guard (the function throws on length
   mismatch, so the guard is load-bearing — see Mike's review of
   NES-1644 #2). Naive `===` is exploitable via response-latency
   side channels for high-volume attackers.

CSRF posture on the admin-side proxies: POST + `X-Requested-With:
XMLHttpRequest` for the revalidate proxy (consumed by
`useRevalidateTemplateGallery` via `fetch` + headers); GET +
`Sec-Fetch-Site === 'same-origin' | 'none'` for the preview proxy
(consumed by `window.open`). `Sec-Fetch-Site` is set automatically
by browsers on every request and cannot be spoofed from JavaScript,
so it's a sound CSRF defence for navigation-shaped endpoints where
`X-Requested-With` doesn't fit.

### 16. Custom-domain publish gate: client-side `useCanPublishCollection` over `useCustomDomainsQuery` (NES-1644)

Template-gallery collections are routed off `your.nextstep.is`
only. Teams with a `customDomain.routeAllTeamJourneys === true`
domain have no public path that resolves to a gallery page, so the
Publish CTA is gated.

`useCanPublishCollection(teamId)` returns
`{ canPublish, reason, loading }`. Two contracts worth keeping:

- **Loading: fail-open.** While the customDomains query is in
  flight (or `teamId` hasn't resolved yet), `canPublish: true`.
  Failing closed during the loading flicker disables the CTA on
  every page render until the query lands — a UX papercut for the
  common case (most teams don't have custom domains).
- **Error: fail-closed.** If the query errors (network, 500), we
  cannot determine whether the team has a routeAll domain.
  `canPublish: false` with a distinct "couldn't check" reason. The
  alternative (fail-open on error) would let a custom-domain team
  publish a page that won't route from their domain. The hook also
  `console.warn`s on this branch so operators see silent prod
  failures.

The server is authoritative — the backend publish resolver will
reject the same condition independently. This hook is a UX
guardrail; never the security boundary.

Don't conflate the gate's routeAll semantics with the existing
`useCustomDomainsQuery().primaryHostname` accessor, which returns
`customDomains[0]?.name` for share-link / preview / QR display.
The two answer different questions for teams with multiple custom
domains. The hook's JSDoc surfaces the warning at the API
boundary.

## Prevention

- Default to `cache.updateQuery` for list mutations. Reserve `cache.modify`
  for surgical field patches AND for sibling-entity updates the mutation
  response can't reach (e.g. the source page after a cross-collection move).
- `enableReinitialize` is almost never the right answer. Use `key={id}`
  remount instead.
- Every async dialog handler that touches Formik post-await needs a
  `mountedRef` guard.
- DnD coordination state needs to gate both the start and the children;
  a single `dragInFlight` boolean isn't enough by itself.
- DnD that fires a mutation needs an `optimisticResponse` to avoid the
  flash where the card snaps back to its source position before the
  cache update lands.
- Backend ordering operations on a row with a `(parentId, order)` UNIQUE
  index need a parent-level `FOR UPDATE` lock. Single-transaction
  staging to a fixed sentinel (`order = -1`) collides under concurrency.
- Frontend that sends a "display index" must pair with a backend that
  renumbers contiguously on every membership change — otherwise gaps
  in the column accumulate and break the protocol.
- Don't trust `navigator.clipboard.writeText` inside a modal. Always
  ship the copy-event fallback for the focus-trap edge case.
- Keep components under ~600 lines. Extract sibling components and hooks
  before they pass that bar.
- Shared-secret API endpoints: token rides in `Authorization: Bearer`,
  compared with `timingSafeEqual` after a length-check guard. Never in
  the URL.
- Side-effecting API endpoints behind cookie auth need a CSRF gate.
  POST + `X-Requested-With` for fetch-shaped consumers; GET +
  `Sec-Fetch-Site` for navigation-shaped consumers.
- ISR-backed public pages with `revalidate: N` need a mutation-driven
  revalidate signal AND a navigation-time safety-net revalidate. Don't
  rely on ISR's interval alone.
- Custom-domain feature gates: fail-open while loading, fail-CLOSED on
  query error with a distinct reason copy. Log the error.
- `getStaticProps` null-branch logging: log only when `errors !== null`;
  cap error count; whitelist extension fields (never log raw
  `extensions` — can leak stack traces / Prisma context).

## Cross-references

- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md`
  — Patterns 2 (cache.modify) and 3 (enableReinitialize trap) are
  extended by this PR. Pattern 2 in particular is now richer: the
  list-shaped case wants `cache.updateQuery`, but the
  cross-entity-sibling case (move from page A to page B) genuinely
  needs `cache.modify` in the mutation's `update` callback.
- `docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md`
  — Backend NES-1547 used this pattern for `templateGalleryPageBySlug`.
- `apps/journeys-admin/src/libs/copyToClipboard/` — shared
  `copyToClipboard` helper used by the publish-success dialog and the
  preview-pane URL field.
- `apis/api-journeys-modern/src/schema/templateGalleryPage/applyContiguousOrder.ts`
  — `lockPage` + `applyContiguousOrder` helpers shared between the
  reorder and assign resolvers.
- `apps/journeys-admin/src/libs/useRevalidateTemplateGallery/` —
  fire-and-forget revalidate hook (Pattern 14).
- `apps/journeys-admin/pages/api/preview-template-gallery.ts` +
  `apps/journeys-admin/pages/api/revalidate-template-gallery.ts` +
  `apps/journeys/pages/api/revalidate-template-gallery.ts` —
  three-layer revalidate chain (Patterns 14 + 15).
- `apps/journeys-admin/src/libs/useCanPublishCollection/` +
  `apps/journeys-admin/src/libs/useCustomDomainsQuery/` — custom-
  domain publish gate (Pattern 16).
- `apps/journeys/pages/home/template-gallery/[slug].tsx` —
  null-branch `getStaticProps` diagnostic log (NES-1644 enrichment).
- NES-1677 backend cache-invalidation (PR #9217) — the typename-
  level `cache.invalidate` calls in api-journeys-modern mutations
  that close the publish→unpublish→republish stale-null gap. The
  frontend revalidate chain (Pattern 14) and the backend cache
  invalidation (NES-1677) are complementary: the backend evicts the
  GraphQL response cache, the frontend evicts the Next ISR cache.

## Related work split out

- NES-1637 Share Again — separate ticket; not in PR #9143.
- The per-template-card "Publish" context-menu entry was abandoned in
  favor of the existing Collection card More menu.
- The "Preparing your template page" loading dialog was cut entirely.
