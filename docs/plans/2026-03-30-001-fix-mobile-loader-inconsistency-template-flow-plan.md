---
title: 'fix: Mobile loader inconsistency & button unresponsiveness during template selection flow'
type: fix
status: completed
date: 2026-03-30
ticket: NES-1510
deepened: 2026-03-30
---

# fix: Mobile loader inconsistency & button unresponsiveness during template selection flow

## What Shipped

**PR:** [#8933](https://github.com/JesusFilm/core/pull/8933) — 3 commits, 8 files changed

**Scope reduced from plan.** The original plan covered all screens and the double-tap bug. What actually shipped:

- **Fixed:** LanguageScreen loader flashing/disappearing — `handleNext` now awaits `router.replace`, LanguageScreen uses catch-only instead of `finally` for `setLoading(false)`
- **Added defensively:** try/catch in TextScreen, LinksScreen, MediaScreen, SocialScreen to handle the new throw from `handleNext` (prevents unhandled rejections, resets loading on failure)
- **Not fixed:** Double-tap bug on other screens — QA was unable to reproduce consistently. The symptom (button lightens briefly but doesn't enter loading state) suggests a mobile touch event issue unrelated to the `router.replace` fire-and-forget pattern. To be investigated separately if it resurfaces.

---

## Enhancement Summary

**Deepened on:** 2026-03-30
**Research agents used:** julik-frontend-races-reviewer, framework-docs-researcher (Next.js source), kieran-typescript-reviewer, performance-oracle, code-simplicity-reviewer, codebase-explorer

### Key Improvements from Research

1. **LanguageScreen `finally` block must become catch-only** — `setLoading(false)` in `finally` runs after component unmounts on success (harmless in React 18, but semantically wrong and fragile)
2. **`router.replace` can return a never-resolving Promise** for hard navigations — not relevant to this flow, but documented for awareness
3. **No performance cost** — awaiting navigation is purely a correctness fix; the same work happens either way
4. **Existing codebase patterns** — 6+ examples of `await router.push/replace` already exist in `journeys-admin` (GoogleCreateIntegration, UserMenu, TeamOnboarding, etc.)

### New Edge Cases Discovered

1. `router.replace` resolves **after** the new component mounts (old unmounts) — state updates in success path are no-ops
2. Concurrent `router.replace` calls: first is cancelled (returns `false`), second proceeds
3. MUI v7 `loading={true}` disables the button, preventing double-tap at the DOM level
4. Formik's `isSubmitting` also resolves post-unmount when `onSubmit` returns `Promise` — harmless but noted

---

## Overview

During the template customization multi-step form on mobile, tapping "Next" produces three inconsistent behaviors: no loader, loader flashes then disappears, or button appears tapped but does nothing (requires second tap). All three symptoms trace to the same root cause.

## Problem Statement

In `MultiStepForm.tsx:106`, `handleNext` fires navigation as fire-and-forget:

```typescript
void router.replace(buildCustomizeUrl(targetJourneyId, nextScreen, undefined))
```

The `void` keyword discards the `router.replace()` Promise. This means `handleNext()` resolves **immediately** — before the browser actually navigates. Every screen that calls `handleNext()` has no signal for when navigation completes or fails.

### Symptom Mapping

| Symptom                                   | Cause                                                                                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **No loader**                             | `shouldSkipDuplicate` fast path: `handleNext()` returns instantly → `finally { setLoading(false) }` fires before loader is visible           |
| **Loader flashes then stops**             | Duplication mutation takes time (loader visible), then `handleNext()` returns instantly → `finally` kills loader before navigation completes |
| **Button does nothing, needs second tap** | `router.replace()` silently fails on mobile → loading already reset → button looks tappable but navigation didn't happen                     |

## Proposed Solution

Make `handleNext` actually await navigation, and propagate success/failure back to callers so loading states stay accurate.

### Key Design Decision: `handleNext` throws on navigation failure

`router.replace()` returns `Promise<boolean>` — resolves `true` on success, `false` when navigation is aborted (e.g. by another navigation). It only rejects on actual errors. A simple `try/catch` in screen components would miss the `false` case.

**Decision:** `handleNext` will check the return value and throw when `router.replace` returns `false`, so all screen-level `catch` blocks work uniformly.

### Research Insights: Next.js `router.replace` Promise Lifecycle

From direct analysis of Next.js 15.5.7 Pages Router source code (`node_modules/next/dist/shared/lib/router/router.js`):

**Resolution order when navigation succeeds:**

1. React renders the new component tree
2. React commits to DOM (new component mounts, **old component unmounts**)
3. `onRootCommit` fires, resolving the internal render promise
4. `routeChangeComplete` event emits
5. `router.replace()` resolves with `true`

**This means:** Any code after `await router.replace()` runs **after the calling component has unmounted**. State updates (`setLoading(false)`, `setNavigating(false)`) become no-ops. In React 18, this is silently ignored (no warning). This is correct behavior — on success, the component is gone and doesn't need cleanup.

**When `router.replace` returns `false`:**

- Another navigation preempted it (first navigation cancelled via `clc` mechanism)
- URL is not a local URL (hard navigation triggered)
- Client build manifest failed to load

**When `router.replace` rejects (throws):**

- Actual errors during route resolution (not cancellations — those return `false`)

**Never-resolving promise (edge case, not relevant here):**

- Hard navigation via `window.location.href` returns `new Promise(()=>{})` — browser unloads the page before anyone awaits

## Acceptance Criteria

- [ ] Tapping "Next" on any customization screen shows a loader that persists until navigation completes
- [ ] If navigation fails, the loader stops and the button becomes tappable again (user can retry)
- [ ] The loader never flashes and disappears prematurely on LanguageScreen
- [ ] No double-tap issues (MUI v7 `loading` prop already disables the button — verified)
- [ ] All existing tests pass with updated router mocks
- [ ] `handleNext` type is `Promise<void>` throughout the component tree
- [ ] No `setState` on unmounted component in the success path (catch-only pattern in LanguageScreen)

## Implementation Plan

### Step 1: Update `handleNext` in MultiStepForm.tsx

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/MultiStepForm.tsx`

Change:

```typescript
// BEFORE (line 101-108)
async function handleNext(overrideJourneyId?: string): Promise<void> {
  const targetJourneyId = typeof overrideJourneyId === 'string' ? overrideJourneyId : journeyId
  const nextScreen = getNextCustomizeScreen(screens, activeScreen)
  if (nextScreen == null) return
  void router.replace(buildCustomizeUrl(targetJourneyId, nextScreen, undefined))
}
```

To:

```typescript
// AFTER
async function handleNext(overrideJourneyId?: string): Promise<void> {
  const targetJourneyId = typeof overrideJourneyId === 'string' ? overrideJourneyId : journeyId
  const nextScreen = getNextCustomizeScreen(screens, activeScreen)
  if (nextScreen == null) return
  const success = await router.replace(buildCustomizeUrl(targetJourneyId, nextScreen, undefined))
  if (!success) {
    throw new Error('Navigation was aborted')
  }
}
```

Update the `renderScreen` type signature:

```typescript
// BEFORE (line 41)
handleNext: (overrideJourneyId?: string) => void

// AFTER
handleNext: (overrideJourneyId?: string) => Promise<void>
```

#### Edge Cases

- **`nextScreen == null`**: Returns without navigating. Callers that `await handleNext()` get a resolved promise — no error, no state to reset. The screen stays mounted with `navigating=true`. This case should not happen in practice (the wizard always has a next screen until DoneScreen, which doesn't call `handleNext`). If it does, the button stays in loading state — safe but not ideal. Acceptable since this is a guard clause for an impossible state.
- **Concurrent calls**: If `handleNext` is called twice rapidly, the second `router.replace` cancels the first (via Next.js `clc` mechanism). The first `await` resolves `false` → throws → catch resets state. The second proceeds normally. MUI `loading={true}` prevents this at the DOM level, but the throw/catch pattern handles it correctly if it ever occurs.

### Step 2: Update LanguageScreen.tsx — CRITICAL: catch-only pattern

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LanguageScreen/LanguageScreen.tsx`

Update the prop interface:

```typescript
interface LanguageScreenProps {
  handleNext: (overrideJourneyId?: string) => Promise<void>
}
```

**Change `finally` to catch-only.** The `finally { setLoading(false) }` pattern is wrong when `handleNext` is awaited, because on success the component has already unmounted by the time `finally` runs. While React 18 silently ignores the no-op `setState`, the correct pattern is catch-only:

```typescript
// BEFORE
async function handleSubmit(values: LanguageFormValues) {
  setLoading(true)
  try {
    // ... mutation logic ...
    if (shouldSkipDuplicate(journey, values)) {
      handleNext() // not awaited
      return
    }
    // ... duplication ...
    handleNext(duplicatedJourneyId) // not awaited
  } catch {
    enqueueSnackbar(errorMessage, { variant: 'error' })
  } finally {
    setLoading(false) // runs immediately, before navigation completes
  }
}

// AFTER
async function handleSubmit(values: LanguageFormValues) {
  setLoading(true)
  try {
    // ... mutation logic ...
    if (shouldSkipDuplicate(journey, values)) {
      await handleNext() // awaited — resolves after navigation
      return // component is unmounted, no cleanup needed
    }
    // ... duplication ...
    await handleNext(duplicatedJourneyId) // awaited
    // Success: component unmounts, no cleanup needed
  } catch {
    enqueueSnackbar(errorMessage, { variant: 'error' })
    setLoading(false) // Only reset on failure, when component is still mounted
  }
}
```

**Why catch-only:** On success, the component navigates away and unmounts — there is no spinner to hide. On failure (mutation error OR navigation abort), the component stays mounted and the user needs the button re-enabled to retry.

#### Edge Cases

- **Mutation succeeds but navigation fails**: `handleJourneyDuplication` succeeds, `handleNext` throws. The journey is duplicated but the user stays on LanguageScreen. `setLoading(false)` runs, button is re-enabled. User can tap again — `shouldSkipDuplicate` will detect the already-duplicated journey and skip to navigation only. No data loss.
- **Formik `isSubmitting`**: Formik internally resolves `isSubmitting` when the `onSubmit` promise settles. On success, this is a no-op (unmounted). On failure, Formik resets `isSubmitting` alongside our `setLoading(false)`. Both reset correctly.

### Step 3: Update TextScreen.tsx

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/TextScreen/TextScreen.tsx`

Update prop interface and wrap `handleNext` in try/catch:

```typescript
interface TextScreenProps {
  handleNext: (overrideJourneyId?: string) => Promise<void>
}

// In handleSubmit (around line 188-189):
setNavigating(true)
try {
  await handleNext()
} catch {
  setNavigating(false)
}
```

#### Edge Cases

- **Mutation fails before navigation**: `journeyCustomizationFieldUpdate` throws → execution never reaches `setNavigating(true)` → button shows `isSubmitting` from Apollo (auto-resets). This path is already correct and unchanged.
- **No changes detected**: `hasChanges` is false → mutation skipped → `setNavigating(true)` → `await handleNext()`. Fast path, works correctly.

### Step 4: Update LinksScreen.tsx

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/LinksScreen/LinksScreen.tsx`

Update prop interface and wrap `handleNext` in try/catch:

```typescript
// In handleFormSubmit (around line 233-234):
setNavigating(true)
try {
  await handleNext()
} catch {
  setNavigating(false)
}
```

#### Edge Cases

- **Partial mutation failure**: `Promise.allSettled` never rejects, so execution always reaches `handleNext()` even if some link mutations failed. This is a pre-existing issue (out of scope) — the user navigates away with partially saved data. This fix does not change that behavior.

### Step 5: Update MediaScreen.tsx

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/MediaScreen/MediaScreen.tsx`

Update prop interface. The button's `onClick` is currently inline — extract to a handler:

```typescript
interface MediaScreenProps {
  handleNext: (overrideJourneyId?: string) => Promise<void
}

// Replace inline onClick:
async function handleNavigateNext(): Promise<void> {
  setNavigating(true)
  try {
    await handleNext()
  } catch {
    setNavigating(false)
  }
}

// In JSX:
onClick={handleNavigateNext}
```

#### Edge Cases

- **Active uploads**: Button shows `loading={hasActiveUploads || navigating}`. If uploads are still in progress, `hasActiveUploads` keeps the button in loading state independently. The `navigating` state only matters after uploads complete. No interaction issue.

### Step 6: Update SocialScreen.tsx

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/SocialScreen/SocialScreen.tsx`

Same pattern:

```typescript
interface SocialScreenProps {
  handleNext: (overrideJourneyId?: string) => Promise<void>
}

async function handleNavigateNext(): Promise<void> {
  setLoading(true)
  try {
    await handleNext()
  } catch {
    setLoading(false)
  }
}

// In JSX:
onClick = { handleNavigateNext }
```

### Step 7: Update GuestPreviewScreen.tsx (type only)

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/Screens/GuestPreviewScreen/GuestPreviewScreen.tsx`

Update the prop interface type only (this screen does not call `handleNext` — it uses its own `router.push`):

```typescript
interface GuestPreviewScreenProps {
  screens: CustomizationScreen[]
  handleNext?: (overrideJourneyId?: string) => Promise<void>
}
```

### Step 8: Update Tests

**File:** `apps/journeys-admin/src/components/TemplateCustomization/MultiStepForm/MultiStepForm.spec.tsx` and per-screen test files.

Update router mocks to return resolved Promises:

```typescript
// BEFORE
const mockReplace = jest.fn()

// AFTER
const mockReplace = jest.fn().mockResolvedValue(true)
```

This ensures `await router.replace(...)` resolves properly in tests. Also update `mockPush` if used in GuestPreviewScreen or DoneScreen tests.

#### Test-specific edge cases

- **Tests that assert `mockReplace` call count**: These still work — `mockResolvedValue` doesn't change how `toHaveBeenCalledWith` works.
- **Tests that trigger navigation and check subsequent state**: These may need `await waitFor()` or `await act(async () => {...})` wrappers since navigation is now async. Check each test that clicks the "Next" button.
- **Failure path tests**: Add new tests that verify `mockReplace.mockResolvedValue(false)` causes the loading state to reset. This confirms the error recovery path.

## Edge Case Analysis: Will These Changes Produce Broken Behavior?

### Safe: State updates after unmount (React 18)

React 18 removed the "Can't perform a React state update on an unmounted component" warning. State updates on unmounted components are silently ignored. The catch-only pattern in LanguageScreen avoids this entirely, but even if a stray `setState` runs post-unmount in other screens, it's harmless.

### Safe: MUI Button `loading` prevents double-tap

MUI v7's `loading={true}` sets `disabled` on the button. Between `setNavigating(true)` and React committing the update, there is a theoretical micro-gap where a fast double-tap could fire twice. In practice, React 18's automatic batching processes both the click handler and state update synchronously within the same event, so the button is disabled before the second tap can register. If paranoia is warranted, a `useRef` guard can be added — but this is not necessary for the initial fix.

### Safe: Formik interaction

Formik's `onSubmit` accepts `void | Promise<any>`. When the returned promise settles after component unmount, Formik's internal `isSubmitting` reset is a no-op. No conflict with our `setLoading` state.

### Safe: Closure staleness

`handleNext` captures `journeyId` and `activeScreen` from the `MultiStepForm` closure. These are read synchronously before the `await`, so they reflect the correct values at call time. No stale closure risk.

### Safe: Performance

Zero performance cost. The same navigation work (route matching, chunk fetching, component rendering) happens in both approaches. The only difference is the spinner stays visible for the accurate duration instead of flashing away prematurely. Awaiting actually prevents redundant concurrent navigations, which is a minor network optimization.

### Potential issue: `nextScreen == null` guard

If `getNextCustomizeScreen` returns `null`, `handleNext` resolves without navigating. The calling screen's `navigating` state stays `true` permanently. This should never happen in the normal wizard flow (each screen except DoneScreen has a next screen), but if it did, the button would be stuck in loading state. This is a pre-existing issue (the current `void` version has the same problem — it just doesn't show a loader). Low risk, acceptable.

## Out of Scope

- **DoneScreen / GuestPreviewScreen navigation**: These use their own `router.push` to navigate away from the wizard entirely. Same fire-and-forget pattern, but separate user flow. Can be addressed in a follow-up.
- **LinksScreen partial mutation failure**: `Promise.allSettled` silently swallows individual mutation failures, navigating even when some links failed to save. Pre-existing issue — file separately.
- **Navigation timeout / retry UI**: On extremely slow mobile networks, the spinner could persist indefinitely. A timeout with "Try again" would improve UX but adds complexity beyond this bug fix. Route prefetching (`router.prefetch`) would be the right optimization if this becomes a problem.
- **Lifting `navigating` state to MultiStepForm**: Each screen manages its own loading/navigating state independently. Consolidating is a refactor, not a bug fix.

## Dependencies & Risks

- **Risk: Next.js `router.replace` behavior edge cases** — `router.replace` can return `false` when another navigation preempts it (e.g., browser back button during transition). The proposed `throw new Error('Navigation was aborted')` handles this, but the error message should be generic since the user won't see it — it only triggers the catch block to reset state.
- **Risk: Test breakage** — Router mocks must be updated to return Promises. Any test that asserts `mockReplace` was called without accounting for the Promise will need updating. Tests that click "Next" and assert state changes may need `waitFor` wrappers.
- **Mitigated: setState on unmount** — Catch-only pattern in LanguageScreen avoids this. Other screens set `navigating=true` before await and only reset in catch (failure path, component still mounted). No unmount warnings possible.

## Sources & References

- **Linear ticket:** [NES-1510](https://linear.app/jesus-film-project/issue/NES-1510)
- **Recent related fix:** Commit `8005461de` — "fix: team selection race condition in template customization (NES-1465)"
- **MUI v7 Button `loading` prop:** Verified in `node_modules/@mui/material/Button/Button.js:652` — "If `true`, the loading indicator is visible and the button is disabled"
- **Next.js Router source:** `node_modules/next/dist/shared/lib/router/router.js` — `change()` method (line 454+), `router.replace` returns `Promise<boolean>`, resolves after React commit phase
- **Existing codebase patterns:** `await router.replace` used in GoogleCreateIntegration.tsx, UserMenu.tsx, TeamOnboarding.tsx, GoogleIntegrationRemoveDialog.tsx, GrowthSpacesCreateIntegration.tsx
