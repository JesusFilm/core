---
title: 'Subscription-bridged dialog orchestration: mutation → subscription → mutation with unmount safety and cross-component lock cleanup (NES-1637)'
date: 2026-05-21
category: best-practices
module: apps/journeys-admin
problem_type: ui_pattern
component: journeys-admin/TemplateGalleryPageList
tags:
  - apollo-client
  - use-subscription
  - sse
  - on-complete-bridge
  - mounted-ref
  - guarded-close
  - dnd-lock
  - gallery-dialog-lock-context
  - loading-ref
  - single-flight
  - formik
  - unmount-safety
  - lifecycle-effect
applies_when:
  - 'A journeys-admin component chains an Apollo mutation, then a useSubscription call, then a second Apollo mutation — where the subscription is the bridge between the two mutations'
  - 'The subscription is callback-driven (Apollo useSubscription) and surfaces its terminal signal through onComplete / onError, not a Promise'
  - 'The component participates in a cross-component lock signal (e.g., setHasOpenDialog into GalleryDialogLockContext) that must be released on unmount, not only on explicit user close'
  - 'The dialog stays mounted across the full pipeline (the parent uses handleKeepMounted so the menu-item subtree survives mid-flight)'
  - 'Single-flight defence against rapid double-clicks is needed, and the disabled-prop check on the submit button is one React render cycle late'
---

# Subscription-bridged dialog orchestration (NES-1637)

## Context

Journeys-admin dialog components that orchestrate a multi-step async pipeline — Apollo mutation → translation → second Apollo mutation — face a structural problem that makes the naive implementation fail silently in production.

The naive approach is to write a single `async handleSubmit` and `await` each step in sequence:

```ts
// naive — this does NOT work
const { data } = await journeyDuplicate(...)
await translationComplete(...)       // ← no Promise to await; useSubscription is callback-driven
await templateGalleryPageAssignJourney(...)
```

`useJourneyAiTranslateSubscription` is backed by `useSubscription` and emits its terminal signal through an `onComplete` callback, not a Promise. There is nothing to `await`. Any implementation that tries to model the translation step as an awaitable collapses the bridge between duplicate and assign: either the assign never fires, or it fires before translation has finished.

A second, independent failure mode is lifecycle management. Dialogs in the gallery page stay mounted across the full pipeline (the `TemplateGalleryPage` keeps the menu-item subtree alive via `handleKeepMounted`), so the component can be unmounted mid-pipeline — by route navigation, a parent re-render, or the user dismissing the dialog — while async operations are still in flight. Two gaps interact here:

1. A `mountedRef` check placed only AFTER `await mutation` still lets the network request fire when the component is already unmounted. The server creates a side-effect the user has no UI feedback about.
2. A `setHasOpenDialog?.(false)` call placed only in the normal-close path (`guardedClose`) is never reached when the component unmounts abnormally. The `GalleryDialogLockContext` boolean stays `true`, permanently disabling drag-and-drop on the gallery page for the rest of the session.

`CopyToTeamMenuItem` (`apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx`) established the subscription callback split pattern, but predates the gallery page and missed both of these cleanup gaps. `CopyToCollectionMenuItem` (NES-1637) is the first component to close all three gaps together.

## Guidance

### 1. Split orchestration into two handlers

`useSubscription`-based translation cannot be awaited. The correct shape splits orchestration into two handlers connected by the subscription's `onComplete` callback:

- `handleSubmit` — entry point; fires `journeyDuplicate`, then either arms the subscription (`setTranslationVariables`) and exits, OR calls `runAssign` directly when no translation is needed.
- `runAssign(newJourneyId, targetCollectionId)` — post-translation entry point; fires `templateGalleryPageAssignJourney`. The subscription's `onComplete` calls this function when translation completes.

Plan pseudocode (illustrative, from `docs/plans/2026-05-21-001-feat-nes-1637-copy-to-collection-action-plan.md`):

```text
handleSubmit({ collectionId, language?, showTranslation? }):
  if loading: return                            // single-flight guard
  teamId = activeTeam?.id
  if teamId == null:
    setError(noActiveTeamCopy); return          // null guard
  setLoading(true)
  newJourneyId <- await journeyDuplicate(journey.id, teamId)
    on throw: setError(duplicateFailCopy); return       // no rollback
  pendingTargetCollectionId = collectionId
  if showTranslation && language:
    setTranslationVars({ journeyId: newJourneyId, ...langArgs })
    return                                              // exit; onComplete fires runAssign
  runAssign(newJourneyId, collectionId)

runAssign(newJourneyId, targetCollectionId):
  await templateGalleryPageAssignJourney(newJourneyId, targetCollectionId)
    on throw: refetch(GetAdminJourneys); setError(assignFailCopy); return
  refetch(GetAdminJourneys)
  setDone(true)

// wired via useJourneyAiTranslateSubscription({ variables, skip, onComplete, onError })
onComplete (subscription terminates):
  if mountedRef: runAssign(newJourneyIdRef, pendingTargetCollectionIdRef)

onError:
  if mountedRef:
    refetch(GetAdminJourneys)
    setError("An error occurred while translating.")
```

The post-duplicate IDs are stashed in refs (`newJourneyIdRef`, `pendingTargetCollectionIdRef`) rather than read from Formik values, because Formik may be torn down by the time the subscription's `onComplete` fires. The subscription bridge carries no data — it is a pure signal to proceed to `runAssign`.

`CopyToTeamMenuItem` established the same callback split first, but its `onComplete` performs the equivalent of `runAssign` inline (updating team state, calling `handleCloseMenu`, closing the dialog) rather than delegating to a named function — and it does not gate the call on `mountedRef`.

### 2. Gate the network call, not just setState

The standard `mountedRef` guard pattern (NES-1539 Pattern 3) teaches placing `if (!mountedRef.current) return` checks after each `await` to prevent `setState` calls on unmounted components. This is necessary but not sufficient when the operation being guarded is itself a network mutation.

The gap in `CopyToTeamMenuItem`: `handleDuplicateJourney` calls `setLoading(false)` after `await journeyDuplicate(...)`, but the network call itself is not gated. If the component unmounts during the duplicate await, the mutation has already been sent to the server.

The `CopyToCollectionMenuItem` fix — `runAssign` early-returns before the `await templateGalleryPageAssignJourney` call when `!mountedRef.current`:

```tsx
const runAssign = async (
  newJourneyId: string,
  targetCollectionId: string
): Promise<void> => {
  // Gate the network call itself on mount status — the assign
  // mutation would otherwise fire after unmount (subscription
  // onComplete races a closing dialog), creating a silent server-side
  // orphan the user has no UI feedback about.
  if (!mountedRef.current) return        // ← BEFORE the await
  try {
    await templateGalleryPageAssignJourney({
      variables: { journeyId: newJourneyId, pageId: targetCollectionId }
    })
    refetchAdminJourneys()
    if (!mountedRef.current) return      // ← AFTER the await (standard NES-1539 guard)
    safeSetLoading(false)
    setTranslationVariables(null)
    setDone(true)
  } catch {
    refetchAdminJourneys()
    if (!mountedRef.current) return
    safeSetLoading(false)
    setTranslationVariables(null)
    setErrorMessage(assignFailCopy)
  }
}
```

Both checks serve different purposes: the pre-await check prevents the network side-effect; the post-await check prevents stale `setState` calls after the response returns.

The `safeSetLoading` helper mirrors a similar dual-write pattern — it keeps `loadingRef.current` and the `loading` state slot synchronized, so the single-flight guard in `handleSubmit` reads the ref (synchronous, no re-render) while the dialog component reads the state (reactive):

```tsx
const safeSetLoading = (next: boolean): void => {
  loadingRef.current = next
  if (mountedRef.current) setLoading(next)
}
```

The `loadingRef` shadow was flagged by code review as dual-source-of-truth maintenance overhead. It survived as a defensive measure against React render timing: a ref read in `handleSubmit`'s synchronous path is guaranteed to reflect the latest value, whereas state reads in the same synchronous turn can lag by one render cycle on rapid double-clicks. Use this pattern when the disabled-button defence is meaningfully late; skip it when a button-disabled gate alone is sufficient.

### 3. Cross-component lock requires its own unmount cleanup

The `setHasOpenDialog` prop is a signal into `GalleryDialogLockContext` that disables drag-and-drop on the gallery page while a dialog is open. When the component unmounts while this signal is `true` (e.g., the user navigates away during a long-running translation), the lock stays permanently engaged for the rest of the session.

The fix is to release the lock unconditionally in the `useEffect` cleanup:

```tsx
useEffect(() => {
  mountedRef.current = true
  return (): void => {
    mountedRef.current = false
    // Release the DnD lock and null the post-translation refs in case
    // the component unmounts mid-pipeline (route change, parent
    // re-render). Calls are idempotent: `setHasOpenDialog?.(false)`
    // is a no-op when the dialog was never opened, and the refs are
    // already null at mount. Subscription teardown happens via Apollo
    // unsubscribing when this hook unmounts.
    setHasOpenDialog?.(false)
    newJourneyIdRef.current = null
    pendingTargetCollectionIdRef.current = null
  }
  // Lifecycle effect — mount/unmount only. Capturing the latest
  // `setHasOpenDialog` reference is fine because it is a prop that
  // does not change across renders in normal use.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

The cleanup's `setHasOpenDialog?.(false)` is independent of the same call inside `guardedClose`. They handle different cases: `guardedClose` handles the normal close (user clicks Done or Cancel while the component is still mounted); the cleanup handles abnormal close (component unmounts before the user can interact with it). Both are safe to coexist — calling `setHasOpenDialog?.(false)` when the lock was never acquired is a no-op.

The `mountedRef` initialization follows NES-1539 Pattern 3: the setup body sets `mountedRef.current = true`, the cleanup sets it `false`. This avoids the StrictMode double-invoke trap where a cleanup-only flip leaves the ref permanently `false` after the second setup.

`CopyToTeamMenuItem` calls `setHasOpenDialog?.(true)` in its `onClick` handler and `setHasOpenDialog?.(false)` in `onClose`, but has no `useEffect` cleanup for the lock. Because `CopyToTeamMenuItem` predates the gallery page, the `GalleryDialogLockContext` did not exist when it was written; the latent gap is real but has had no visible impact on the team copy flow.

## Why This Matters

**Naive `await translationComplete`.** `useJourneyAiTranslateSubscription` wraps Apollo's `useSubscription`. Its terminal signal is the `onComplete` callback on the hook options object, not a returned Promise. Attempting to `await` the hook's return value waits on an object, resolves immediately, and skips the assign entirely. There is no way to construct a Promise from a `useSubscription` result without a wrapper ref — and that wrapper is exactly what the two-handler split provides without the indirection.

**`mountedRef` only after `await`.** Placing the guard only after the network call has dispatched means the server executes the mutation regardless. For `runAssign`, this creates a journey that has been assigned to a collection (a `templateGalleryPageAssignJourney` side-effect) with no UI confirmation, no error surface, and no user-visible entry in the UI (because the component that would show it is gone). The `refetchAdminJourneys()` call in `runAssign`'s catch branch is also never reached, so the orphan does not appear in All Templates either. The only visible symptom is silence.

**Missing unmount cleanup for the DnD lock.** `GalleryDialogLockContext` is a boolean held in React context at the `TemplateGalleryPageList` level. It gates the `handleDragStart` callback on every draggable card and the `handleDragEnd` drop handler. If it stays `true`, every drag attempt is silently rejected: the card picks up visually, but `handleDragStart` returns early before setting `dragInFlight`, so `handleDragEnd` receives an inconsistent state and discards the drop. The user sees drag-and-drop stop working with no error. The lock is not persisted — it resets on full page reload — but within a session it permanently breaks the gallery's primary organizational affordance.

## When to Apply

Apply this pattern to any journeys-admin dialog component that combines all three of:

- An Apollo mutation followed by `useJourneyAiTranslateSubscription` (or another callback-driven `useSubscription`) followed by a second Apollo mutation — where the subscription is the bridge between the first and second mutations.
- A cross-component lock signal (`setHasOpenDialog`, a drag-lock, a focus-trap, or any boolean held in a context that lives above the dialog boundary) that must be released when the component unmounts, not just when the user closes normally.
- A keep-mounted contract: the parent keeps the menu-item subtree alive via `handleKeepMounted` so the dialog stays mounted across the full pipeline, making mid-pipeline unmount a realistic race condition.

Do not apply the two-handler split to flows where translation is absent or the terminal signal is truly a Promise (e.g., a standard `useMutation` call). In those cases, a single `async handleSubmit` with sequential `await` calls is correct and simpler.

Do not apply the unmount-cleanup DnD-lock pattern to dialog components outside the `TemplateGalleryPageList` subtree. Components that do not receive `setHasOpenDialog` (or its equivalent) are not participating in the lock context and need no cleanup for it.

## Examples

### Reference implementation

`apps/journeys-admin/src/components/TemplateGalleryPageList/CopyToCollectionMenuItem/CopyToCollectionMenuItem.tsx` — the canonical example. The three patterns are integrated as a single coherent flow:

- Lines ~81–99: lifecycle effect with setup-body `mountedRef = true`, cleanup releases DnD lock + nulls bridge refs.
- Lines ~119–148: `runAssign` with pre-await + post-await `mountedRef` checks bracketing the assign mutation.
- Lines ~163–212: `handleSubmit` with single-flight `loadingRef` guard, null-team guard, duplicate, bridge-ref population, conditional subscription arm OR direct `runAssign`.
- Lines ~217–234: `useJourneyAiTranslateSubscription` with `onComplete` calling `runAssign(newJourneyIdRef.current, pendingTargetCollectionIdRef.current)` and `onError` issuing the refetch + error copy.

### Precedent (with latent gaps)

`apps/journeys-admin/src/components/Team/CopyToTeamMenuItem/CopyToTeamMenuItem.tsx` — established the subscription callback split pattern first. Two latent gaps remain in this file, exposed only when used in a context that has both `GalleryDialogLockContext` and mid-pipeline unmount pressure:

- The subscription `onComplete` updates team state and closes the dialog without a `mountedRef` check (the post-await `setState`-on-dead-component issue).
- The `setHasOpenDialog` lock is acquired on open and released only in `onClose` — no `useEffect` cleanup for abnormal unmount.

Neither gap has had visible impact on the team-copy flow because that flow predates the gallery page's lock context. Any future component that introduces a cross-boundary lock signal via `setHasOpenDialog` must include the unmount cleanup from the start.

## Related

- `docs/solutions/best-practices/template-gallery-page-collections-patterns-nes1539.md` — Pattern 3 (`mountedRef` + `guardedClose` for async dialog submits) is the foundational variant this doc extends. NES-1539 covers the single-mutation case; this doc extends it to the mutation → subscription → mutation case with cross-component lock cleanup. NES-1539 Patterns 5 (cross-mutation gate) and 11 (`optimisticResponse` for `templateGalleryPageAssignJourney`) are also relevant.
- `docs/solutions/best-practices/local-template-dialog-consolidation-patterns-nes1543.md` — Pattern 3 prohibits `enableReinitialize` on Formik dialogs that interact with subscription-driven cache writes. The `CopyToCollectionDialog` follows this rule.
- `docs/solutions/runtime-errors/yoga-response-cache-null-stickiness-and-zombie-process-debugging-nes1644.md` — backend Yoga cache TTL=0 config for the `templateGalleryPage` queries that the post-pipeline `refetchAdminJourneys` interacts with. Out of scope here but worth knowing when debugging refetch-failure cases.
- PR [#9237](https://github.com/JesusFilm/core/pull/9237) — NES-1637 implementation.
- Linear [NES-1637](https://linear.app/jesus-film-project/issue/NES-1637) — feature ticket including the scope-pivot addendum.
