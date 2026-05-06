---
title: 'Template Gallery Page (Collections) frontend patterns (NES-1539)'
category: best-practices
date: 2026-05-06
problem_type: ui_pattern
component: journeys-admin/TemplateGalleryPageList
tags:
  - apollo-client
  - cache-modify
  - cache-update-query
  - formik
  - dnd-kit
  - mutation-routing
  - tab-panel
  - flag-rollout
  - mounted-ref
  - dialog
  - nx-monorepo
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9143'
  - 'https://github.com/JesusFilm/core/pull/9119'
related_tickets:
  - NES-1539
  - NES-1607
  - NES-1547
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
single field. For prepending into a *list-shaped* query result, the
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
useEffect(() => () => { mountedRef.current = false }, [])

// in handleSubmit, after each await:
if (!mountedRef.current) return
helpers.setFieldError(...)
enqueueSnackbar(...)
```

Pair it with a `guardedClose` that no-ops while `isSubmitting` is true so
backdrop / Escape / Cancel can't dismiss mid-mutation. See
`apps/journeys-admin/src/components/TemplateGalleryPageList/CollectionDialog/CollectionDialog.tsx`.

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

### 10. Additive flag rollout: new panel sits ABOVE the legacy list

When a flag swaps a panel for an alternative implementation, scope the
swap narrowly so it's reversible. Rolling out Collections by *replacing*
the team-templates list would have removed archive/trash/sort affordances
the moment the flag flipped. Instead, when the flag is on AND
`status === 'active'`, render Collections above the legacy list. The
legacy list keeps every existing affordance; archived/trashed status
filters skip the gallery entirely.

```ts
if (
  contentType === 'templates' &&
  teamTemplateCollection === true &&
  status === 'active'
) {
  return (
    <>
      <TemplateGalleryPageList visible={contentType === currentContentType} />
      <JourneyListContent ... />
    </>
  )
}
```

## Prevention

- Default to `cache.updateQuery` for list mutations. Reserve `cache.modify`
  for surgical field patches.
- `enableReinitialize` is almost never the right answer. Use `key={id}`
  remount instead.
- Every async dialog handler that touches Formik post-await needs a
  `mountedRef` guard.
- DnD coordination state needs to gate both the start and the children;
  a single `dragInFlight` boolean isn't enough by itself.
- When wiring a flag, ask "what does the user lose when this flips on?"
  Additive > replacing.
- Keep components under ~600 lines. Extract sibling components and hooks
  before they pass that bar.

## Cross-references

- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md`
  — Patterns 2 (cache.modify) and 3 (enableReinitialize trap) are extended
  by this PR. The cache.modify guidance should now include the list-shaped
  use case → updateQuery refinement above.
- `docs/solutions/integration-issues/pothos-public-unauthenticated-query-pattern-api-journeys-modern.md`
  — Backend NES-1547 used this pattern for `templateGalleryPageBySlug`.
- Backend follow-up prompt for agent-native parity gaps:
  `docs/prompts/nes-1539-backend-agent-native-additions.md` (adds
  `Query.templateGalleryPage(id)` and resolved `publicUrl` field).

## Related work split out

- NES-1637 Share Again — separate ticket; not in PR #9143.
- The per-template-card "Publish" context-menu entry was abandoned in
  favor of the existing Collection card More menu.
- The "Preparing your template page" loading dialog was cut entirely.
