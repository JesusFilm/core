---
title: Multi-action Formik dialog footer with intent-ref submit handler
date: 2026-05-24
category: design-patterns
module: journeys-admin/template-gallery
problem_type: design_pattern
component: tooling
severity: medium
applies_when:
  - 'A Formik form needs multiple submit-style buttons that share validation, field values, and error mapping but trigger different mutations'
  - 'Splitting onSubmit into separate handlers would duplicate validation, error mapping, or field normalization'
  - 'One footer action (e.g. Unpublish, Delete) should bypass Formik entirely and discard pending field edits'
related_components:
  - tooling
tags:
  - formik
  - mui
  - dialog
  - multi-action-submit
  - intent-ref
  - template-gallery
---

# Multi-action Formik dialog footer with intent-ref submit handler

## Context

Dialog forms often grow beyond a single submit action. The Template Gallery `CollectionDialog` in `apps/journeys-admin/` has four distinct footer configurations depending on mode and publish state:

- **Create mode**: `Cancel | Create`
- **Edit mode (draft)**: `Cancel | Save`
- **Edit mode (published)**: `Cancel | Unpublish | Save`
- **Publish mode (draft)**: `Cancel | Save Draft | Publish`

The friction: `Save Draft` and `Publish` differ only in whether a publish mutation fires after the update. They share the same Formik values, the same Yup validation, the same field-level error mapping, and the same `isSubmitting` lifecycle. Splitting them into two independent `onSubmit` handlers — or two separate Formik instances — duplicates all of that and creates two divergent error-handling paths that immediately drift.

Meanwhile `Unpublish` is fundamentally different: it ignores form values entirely and just changes status. Forcing it through Formik would either run irrelevant validation or require special-case bypass logic inside `handleSubmit`.

The pattern below resolves both: **one Formik path for actions that share validation, plus a parallel non-Formik path for orthogonal actions**.

## Guidance

### Part 1: Intent-ref for shared-validation actions

Hold the user's intent in a `useRef`, flip it synchronously in the button's `onClick`, then call Formik's `submitForm`. The single `handleSubmit` reads the ref and branches:

```ts
// useCollectionForm.ts
const submitIntentRef = useRef<'publish' | 'draft'>('publish')

const setSubmitIntent = (intent: 'publish' | 'draft'): void => {
  submitIntentRef.current = intent
}

async function handleSubmit(values, helpers) {
  // ...diffed update logic shared by all modes...
  const shouldPublish = mode === 'publish' && submitIntentRef.current === 'publish'

  if (Object.keys(input).length > 0) {
    await templateGalleryPageUpdate({ variables: { id, input } })
  }
  if (shouldPublish) {
    await templateGalleryPagePublish({ variables: { id } })
    // ...
  }
  onClose()
}
```

```tsx
// CollectionDialog.tsx
<Button onClick={() => { setSubmitIntent('draft'); handleSubmit() }}>
  Save Draft
</Button>
<Button onClick={() => { setSubmitIntent('publish'); handleSubmit() }}>
  Publish
</Button>
```

### Part 2: Bypass-Formik for orthogonal actions

For an action that doesn't logically submit the form (here, `Unpublish`), skip Formik entirely and manage its own lifecycle:

```ts
async function handleUnpublishAction() {
  if (submittingRef.current) return
  submittingRef.current = true
  setUnpublishing(true) // separate flag; Formik's isSubmitting only tracks form submits
  try {
    const { data } = await templateGalleryPageUnpublish({
      variables: { id: collection.id }
    })
    // ...snackbar + onClose...
  } finally {
    submittingRef.current = false
    setUnpublishing(false)
  }
}
```

Then disable every footer button from a unified flag so neither path can double-fire while the other runs:

```tsx
<Button disabled={isSubmitting || isMutating} onClick={handleUnpublishAction}>
  Unpublish
</Button>
```

## Why This Matters

**Why a ref, not state.** The click handler runs `setSubmitIntent(...)` and then `handleSubmit()` in the same tick. A `useState` setter schedules a re-render; the new value is not visible to a synchronous read that happens before React commits. A `useRef` mutation is visible immediately, which is exactly what same-tick branching needs. This is the canonical "imperative latch" use of refs.

**Why default to `'publish'`.** In publish mode the form's primary action is Publish. Formik's default submit path fires on Enter inside any text input — and that path doesn't go through any button's `onClick`, so the ref keeps whatever value it had. Defaulting to `'publish'` makes Enter do the obvious thing instead of silently saving a draft.

**Why bypass Formik for Unpublish.** Three reasons:

1. Unpublish doesn't read form values, so running Yup validation on them is noise — a user with an invalid title shouldn't be blocked from unpublishing.
2. Formik's `isSubmitting` is a single flag; piggybacking a non-submit action onto it confuses error mapping (`setFieldError` after an unpublish failure makes no sense).
3. Conceptual clarity: the footer has two kinds of actions — "submit this form" and "change status of this entity". Keeping them on separate code paths matches the mental model.

**Why one unified `disabled` flag across both paths.** Users can click fast. If `isSubmitting` only covers the Formik path and `isMutating` only covers Unpublish, a click on Unpublish during a Save-Draft submission still fires. Or-ing both flags into every button's `disabled` closes that race.

## When to Apply

Use the **intent-ref** pattern when:

- A dialog or form footer has two or more actions that share validation, share field values, and share error mapping.
- The actions differ only in a post-submit side effect (publish vs save, send vs schedule, submit vs submit-and-close).
- You want one source of truth for `isSubmitting`, error display, and the submit lifecycle.

Use the **bypass-Formik** pattern when:

- An action in the same footer doesn't depend on form values (delete, unpublish, archive, reset).
- The action shouldn't be gated by form validation.
- The action's success/failure UX is independent of field-level errors.

Do **not** use intent-ref when:

- The actions actually need different validation schemas (use separate forms or conditional Yup).
- The branching logic in `handleSubmit` would dwarf the shared logic (split the handlers instead).
- Only one action exists — you don't need a ref to disambiguate a single path.

## Examples

### Before: two independent handlers (the anti-pattern)

```ts
async function handleSaveDraft(values) {
  if (!(await validateForm(values))) return
  try {
    setSavingDraft(true)
    const input = diff(values, initialValues)
    if (Object.keys(input).length > 0) {
      await templateGalleryPageUpdate({ variables: { id, input } })
    }
    onClose()
  } catch (e) {
    mapApolloErrorsToFields(e, setFieldError) // duplicated
  } finally {
    setSavingDraft(false)
  }
}

async function handlePublish(values) {
  if (!(await validateForm(values))) return
  try {
    setPublishing(true)
    const input = diff(values, initialValues)
    if (Object.keys(input).length > 0) {
      await templateGalleryPageUpdate({ variables: { id, input } })
    }
    await templateGalleryPagePublish({ variables: { id } })
    onClose()
  } catch (e) {
    mapApolloErrorsToFields(e, setFieldError) // duplicated again
  } finally {
    setPublishing(false)
  }
}
```

Problems: two `validateForm` calls, two `try/catch` blocks, two submitting flags, two divergent error-mapping copies, and Formik's own `isSubmitting`/`setSubmitting` is bypassed entirely so field-level error helpers behave inconsistently.

### After: one handler, ref-disambiguated

```ts
async function handleSubmit(values, helpers) {
  const input = diff(values, initialValues)
  const shouldPublish = mode === 'publish' && submitIntentRef.current === 'publish'
  if (Object.keys(input).length > 0) {
    await templateGalleryPageUpdate({ variables: { id, input } })
  }
  if (shouldPublish) {
    await templateGalleryPagePublish({ variables: { id } })
  }
  onClose()
}
```

Formik handles `isSubmitting`, error mapping runs once, Yup validates once, and the button intent is the only thing the buttons actually need to communicate.

### The actual CollectionDialog footer

```tsx
// Publish mode (draft collection)
<Button onClick={onClose}>Cancel</Button>
<Button
  disabled={isSubmitting || isMutating}
  onClick={() => { setSubmitIntent('draft'); handleSubmit() }}
>
  Save Draft
</Button>
<Button
  variant="contained"
  disabled={isSubmitting || isMutating}
  onClick={() => { setSubmitIntent('publish'); handleSubmit() }}
>
  Publish
</Button>

// Edit mode (published collection)
<Button onClick={onClose}>Cancel</Button>
<Button
  color="error"
  disabled={isSubmitting || isMutating}
  onClick={handleUnpublishAction}
>
  Unpublish
</Button>
<Button
  variant="contained"
  disabled={isSubmitting || isMutating}
  onClick={() => handleSubmit()}
>
  Save
</Button>
```

### Related small patterns picked up alongside this work

- **Auto-name with smallest-unused-N.** When generating default names like `Collection 3`, scan existing titles matching `^Collection (\d+)$` and return the smallest positive integer not in use. Survives deletions cleanly, unlike `count + 1`, which produces collisions after delete-then-create.

- **`outerPadding` prop on shared grid components.** When the same grid is used both inside a card (needs symmetric padding so the grid's gap visually matches the card's edge padding) and at the top level of a page (needs no padding so it aligns flush with sibling card edges), a single boolean prop is cleaner than two near-duplicate components or a wrapper div with margin hacks.

- **Don't gate the entry point if it's the only path to a needed sub-action.** When consolidating menu items into one state-aware entry (e.g. "Edit" for published, "Publish" for draft), move any gating logic _down_ into the dialog (disable the Publish button for empty drafts) rather than disabling the menu item itself. Otherwise the user loses access to legitimate sub-actions like editing draft metadata.

## Related

- [Template Gallery Page Collections patterns (NES-1539)](../best-practices/template-gallery-page-collections-patterns-nes1539.md) — the broader CollectionDialog patterns catalog. This intent-ref pattern is the next entry in that catalog and should be referenced from it.
- [Local Template Dialog Consolidation (NES-1543)](../best-practices/local-template-dialog-consolidation-patterns-nes1543.md) — a sibling pattern: single Formik form firing multiple GraphQL mutations routed by dirty subset (`Promise.allSettled`). Orthogonal to submit-intent routing — that flavor routes on _what changed_, this one routes on _which button was pressed_.
- PR [#9247](https://github.com/JesusFilm/core/pull/9247) — collection create/edit/publish flow rework where this pattern shipped.
