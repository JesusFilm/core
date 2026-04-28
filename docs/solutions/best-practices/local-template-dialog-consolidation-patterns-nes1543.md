---
title: 'Local template dialog consolidation patterns (NES-1543)'
category: best-practices
date: 2026-04-28
problem_type: ui_pattern
component: journeys-admin/Editor/Toolbar
tags:
  - apollo-client
  - formik
  - graphql
  - react
  - nx-monorepo
  - dialog
  - mutation-routing
  - cache-modify
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9093'
  - 'https://github.com/JesusFilm/core/pull/8510'
  - 'https://github.com/JesusFilm/core/pull/3795'
  - 'https://github.com/JesusFilm/core/pull/6755'
  - 'https://github.com/JesusFilm/core/pull/6761'
related_tickets:
  - NES-1543
---

# Local template dialog consolidation patterns (NES-1543)

When NES-1543 merged the legacy "Edit Details" (`JourneyDetailsDialog`) and "Template Settings" (`TemplateSettingsDialog`) dialogs into one `LocalTemplateDetailsDialog` for local templates only (`journey.template === true && journey.team.id !== 'jfp-team'`), the multi-agent ce-review pass surfaced seven recurring patterns and traps. This doc captures all of them in one place because `learnings-researcher` confirmed there was zero prior institutional knowledge on any of them.

## When to use this doc

Reach for it whenever you are:

- Building a Formik form that drives **two or more GraphQL mutations** for different fields.
- Editing journey state from outside the editor (e.g., the template list page) where `JourneyProvider` may not be in scope.
- Sharing a `gql` document or `useMutation` hook across multiple admin dialogs.
- Touching the local-vs-global-template gate (`'jfp-team'`).
- Writing or refactoring a dialog that uses the shared `Dialog` from `@core/shared/ui/Dialog`.

## Pattern 1 — Mutation routing on dirty subset, with `Promise.allSettled`

**Problem.** A single dialog edits fields that map to two different mutations (`useTitleDescLanguageUpdateMutation` for title/description/language, `useJourneyCustomizationDescriptionUpdateMutation` for the publisher customization). Naively firing both on every submit costs an extra round trip and a partial-failure path that's easy to mis-handle.

**Critical trap.** Do **not** consolidate title/description/language into `useJourneyUpdateMutation`. The `useTitleDescLanguageUpdateMutation` document carries a subscription path and the `updatedAt` field consumed by translation polling (PR #6755, #6761, #6543). Dropping it silently breaks translation polling for any journey edited through the dialog.

**Pattern.** Compare each field in `values` to the captured `initialValues`, push into a tasks array per dirty subset, then `Promise.allSettled`. On any rejection, surface a single error snackbar and keep the dialog open; on all-success, close.

```ts
const titleDescLangDirty = values.title !== initialValues.title || values.description !== initialValues.description || values.languageId !== initialValues.languageId
const customizationDirty = values.journeyCustomizationDescription !== initialValues.journeyCustomizationDescription

const tasks: Array<Promise<unknown>> = []
if (titleDescLangDirty)
  tasks.push(
    titleDescLanguageUpdate({
      /* ... */
    })
  )
if (customizationDirty)
  tasks.push(
    journeyCustomizationDescriptionUpdate({
      /* ... */
    })
  )

if (tasks.length === 0) {
  onClose()
  return
}

const results = await Promise.allSettled(tasks)
const failed = results.find((r) => r.status === 'rejected')
if (failed == null) {
  enqueueSnackbar(t('Saved'), { variant: 'success' })
  onClose()
  return
}
const networkError = failed.reason instanceof ApolloError && failed.reason.networkError != null
enqueueSnackbar(networkError ? t('Field update failed. Reload the page or try again.') : t('Something went wrong, please reload the page and try again'), { variant: 'error' })
```

Reference: [`LocalTemplateDetailsDialog.tsx`](apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.tsx).

## Pattern 2 — `cache.modify` for cross-entity mutation responses

**Problem.** `journeyCustomizationFieldPublisherUpdate` returns `JourneyCustomizationField[]`, **not** a `Journey`. Apollo cannot auto-merge the response into the `Journey` entity, so reopening the dialog shows the stale `journey.journeyCustomizationDescription`. The legacy `TemplateSettingsDialog` worked around this with `refetchQueries: ['GetPublisherTemplate']` — but that query is only registered on `pages/publisher/[journeyId].tsx` (the gallery view). On the **editor** view (where local templates live), the refetch is a silent no-op.

**Pattern.** Patch the `Journey` entity directly via `cache.modify`:

```ts
journeyCustomizationDescriptionUpdate({
  variables: { journeyId: journey.id, string: values.journeyCustomizationDescription },
  update(cache) {
    cache.modify({
      id: cache.identify({ __typename: 'Journey', id: journey.id }),
      fields: {
        journeyCustomizationDescription() {
          return values.journeyCustomizationDescription
        }
      }
    })
  }
})
```

This works on **both** the editor and the gallery, with no refetch round trip. Use the same pattern any time a mutation returns a child entity but you need a parent-entity field to stay fresh.

## Pattern 3 — `enableReinitialize` + dirty detection is a trap

**Problem.** Combining Formik's `enableReinitialize` with manual dirty detection (`values.X !== initialValues.X`) silently drops user edits when the underlying journey context re-renders mid-edit (translation polling, Apollo cache writes, subscription pushes). The pattern is:

1. User opens dialog, types into `title`.
2. Translation poll fires, `journey.title` shifts to a translated value, `journey.updatedAt` changes.
3. With `enableReinitialize`, Formik **resets `initialValues` to the new context value**.
4. The dirty check `values.title !== initialValues.title` may now evaluate `false` even though the user typed.
5. User clicks Save → success snackbar → nothing was written.

**Pattern.** Memoize `initialValues` by a stable key (`journey.id`) and **drop `enableReinitialize`**. Re-seeding only happens when the user opens the dialog for a different journey.

```ts
const initialValues = useMemo(
  () => ({
    title: journey?.title ?? '',
    description: journey?.description ?? '',
    languageId: journey?.language?.id ?? '',
    journeyCustomizationDescription: journey?.journeyCustomizationDescription ?? ''
  }),
  // Re-seed only when the journey identity changes; mid-edit polling does not.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [journey?.id]
)

return (
  <Formik initialValues={initialValues} onSubmit={handleSubmit}>
    {/* no enableReinitialize */}
  </Formik>
)
```

PR #3795 originally added `enableReinitialize` to fix an unrelated stale-form bug on `JourneyDetailsDialog` (which fires a single mutation regardless of dirty state, so the trap doesn't apply there). Don't copy that pattern when you start dispatching by dirty subset.

## Pattern 4 — Centralise the `'jfp-team'` predicate

**Problem.** Local-vs-global gating was inlined at 7+ sites pre-NES-1543:

- `apps/journeys-admin/src/components/Editor/Toolbar/Toolbar.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/DetailsItem/DetailsItem.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/Menu/Menu.tsx`
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/JourneyCardMenu.tsx`
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCardMenu/DefaultMenu/DefaultMenu.tsx`
- `apps/journeys-admin/src/components/JourneyList/JourneyCard/JourneyCard.tsx`
- `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx`
- `apps/journeys-admin/src/components/Editor/Toolbar/Items/TemplateSettingsItem/TemplateSettingsDialog/TemplateSettingsDialog.tsx` (as `isGlobalTemplate`)

The magic string `'jfp-team'` drifts the moment global-template ownership moves to a flag, tag, or feature gate.

**Pattern.** A single helper:

```ts
// apps/journeys-admin/src/libs/getIsLocalTemplate/getIsLocalTemplate.ts
export function getIsLocalTemplate(journey?: { template?: boolean | null; team?: { id?: string | null } | null } | null): boolean {
  return journey?.template === true && journey?.team?.id !== 'jfp-team'
}
```

Behaviour matches the prior inline check verbatim, including the quirk that a template with no team is classified as local. NES-1543 ported the four entry points it touched; the remaining sites are a follow-up sweep candidate.

## Pattern 5 — Hoist shared GraphQL documents into stable lib hooks

**Problem.** `JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE` was defined inline in `TemplateSettingsDialog.tsx` and exported from there. The new dialog imported it from the legacy dialog file — the moment that file is renamed, split, or moved, the import breaks silently.

**Pattern.**

1. Extract to `apps/journeys-admin/src/libs/use<Mutation>Mutation/` with both the `gql` const **and** a typed hook wrapper.
2. Export both from the lib's `index.ts`.
3. Re-export the const from the historical location for backwards compatibility with any existing spec or snapshot file:

```ts
// In the legacy dialog file, replace the inline gql with:
export { JOURNEY_CUSTOMIZATION_DESCRIPTION_UPDATE } from '../../../../../../libs/useJourneyCustomizationDescriptionUpdateMutation'
```

The same shape exists for `useTitleDescLanguageUpdateMutation`, `useJourneyUpdateMutation`, `useLanguagesQuery`. Follow that convention for any mutation/query consumed by more than one component.

## Pattern 6 — Optional `journey?` prop bridged into `JourneyProvider`

**Problem.** The template list (`JourneyCardMenu`) receives a journey shaped as `GetAdminJourneys_journeys` (admin-list selection set) and **does not** wrap children in `JourneyProvider`. The shared dialog primitives (`MetadataTabPanel`, `CustomizeTemplate`) read journey via `useJourney()` and expect `JourneyFields`. The naïve fix — `<JourneyProvider value={{ journey: journey as unknown as JourneyFields }}>` at the call site — papers over real field-set mismatches and crashes the dialog the moment it reads a missing field (e.g., `journey.tags.map(...)` on a list-shape journey that lacks `tags`).

**Pattern.** The dialog accepts an optional `journey?` prop with a **narrow** `DialogJourney` shape (only the fields actually consumed) and self-bridges into a local `JourneyProvider` when the prop is supplied:

```tsx
interface DialogJourney {
  id: string
  title?: string | null
  description?: string | null
  language: { id: string }
  journeyCustomizationDescription?: string | null
}

interface Props {
  open: boolean
  onClose: () => void
  journey?: DialogJourney | null
}

export function LocalTemplateDetailsDialog({ open, onClose, journey: journeyProp }: Props) {
  const { journey: journeyFromContext } = useJourney()

  if (journeyProp != null) {
    return (
      <JourneyProvider value={{ journey: journeyProp as unknown as JourneyContext, variant: 'admin' }}>
        <DialogBody open={open} onClose={onClose} />
      </JourneyProvider>
    )
  }
  if (journeyFromContext == null) return <></>
  return <DialogBody open={open} onClose={onClose} />
}
```

The cast is now constrained to one place, the prop type is the documented contract, and call sites either pass nothing (editor with provider in scope) or pass `journey` (list with no provider). Harden every initial-value access with `?? ''` / `?? []` so a list-shape journey can't crash the form when reading optional fields.

## Pattern 7 — `testId` (camelCase) on shared `Dialog`, not `data-testid`

**Trap.** `@core/shared/ui/Dialog` exposes `testId?: string` and forwards it as `data-testid` on the underlying MUI Dialog. Passing `data-testid="..."` directly is silently ignored — TypeScript may flag it as an excess prop or pass it via `...rest` depending on the call shape, but the test won't find it.

```tsx
// ✗ silently dropped
<Dialog data-testid="LocalTemplateDetailsDialog" ... />

// ✓ correct
<Dialog testId="LocalTemplateDetailsDialog" ... />
```

If `screen.getByTestId('YourDialog')` mysteriously can't find a rendered dialog, this is the first thing to check.

## Prevention checklist (drop-in for code review)

- [ ] Form fires two mutations? Use dirty-subset routing + `Promise.allSettled` (Pattern 1).
- [ ] Mutation response is a child of the displayed entity? Use `cache.modify` (Pattern 2).
- [ ] `enableReinitialize` + manual dirty detection? Choose one — drop the other (Pattern 3).
- [ ] Inlined `'jfp-team'` predicate? Use `getIsLocalTemplate(journey)` (Pattern 4).
- [ ] Importing a `gql` document from a sibling component file? Hoist to a lib hook (Pattern 5).
- [ ] Dialog needs to work outside the editor's `JourneyProvider`? Use the optional-prop + self-bridge pattern (Pattern 6).
- [ ] Setting test IDs on `Dialog`? Use `testId`, not `data-testid` (Pattern 7).
- [ ] Spec of `useTitleDescLanguageUpdateMutation` still hits the wire on title/desc/lang edits? (Translation polling regression bait.)

## Reference files

- New dialog: [`apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.tsx`](apps/journeys-admin/src/components/Editor/Toolbar/JourneyDetails/LocalTemplateDetailsDialog/LocalTemplateDetailsDialog.tsx)
- Helper: [`apps/journeys-admin/src/libs/getIsLocalTemplate/getIsLocalTemplate.ts`](apps/journeys-admin/src/libs/getIsLocalTemplate/getIsLocalTemplate.ts)
- Mutation hook: [`apps/journeys-admin/src/libs/useJourneyCustomizationDescriptionUpdateMutation/useJourneyCustomizationDescriptionUpdateMutation.ts`](apps/journeys-admin/src/libs/useJourneyCustomizationDescriptionUpdateMutation/useJourneyCustomizationDescriptionUpdateMutation.ts)
- Existing companion mutation: [`apps/journeys-admin/src/libs/useTitleDescLanguageUpdateMutation/useTitleDescLanguageUpdateMutation.ts`](apps/journeys-admin/src/libs/useTitleDescLanguageUpdateMutation/useTitleDescLanguageUpdateMutation.ts)
- Plan: [`docs/plans/2026-04-28-001-feat-consolidate-local-template-settings-dialog-plan.md`](docs/plans/2026-04-28-001-feat-consolidate-local-template-settings-dialog-plan.md)

## Related work

- PR #8510 — local-template feature suite (introduced the `'jfp-team'` predicate at all the original sites).
- PR #3795 — added `enableReinitialize` on `JourneyDetailsDialog` (the precedent that makes Pattern 3 a trap).
- PRs #6755, #6761, #6543 — `useTitleDescLanguageUpdateMutation` subscription / `updatedAt` / translation polling.
- PR #9093 — NES-1543 implementation.
