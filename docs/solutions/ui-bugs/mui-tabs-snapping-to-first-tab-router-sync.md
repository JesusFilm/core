---
title: 'Fix SignInTabs bounce-back caused by router-driven useEffect overwriting tab state'
date: 2026-04-23
ticket: NES-1599
category: ui-bugs
tags:
  - mui-tabs
  - next-js
  - router
  - use-effect
  - controlled-component
  - sign-in
  - state-management
symptoms:
  - "User selects 'Log In' tab on /users/sign-in and it snaps back to 'New account'"
  - 'Tab selection appears broken or uncontrollable'
  - 'MUI Tabs controlled component reverts to index 0 unexpectedly'
components:
  - 'apps/journeys-admin/src/components/SignInTabs/SignInTabs.tsx'
  - 'apps/journeys-admin/src/components/AccountCheckDialog/AccountCheckDialog.tsx'
  - 'apps/journeys-admin/src/components/CreateJourneyButton/CreateJourneyButton.tsx'
  - 'apps/journeys-admin/src/components/UseThisTemplateButton/UseThisTemplateButton.tsx'
problem_type: 'ui_bug'
---

# MUI Tabs Snapping Back to First Tab Due to Router-Driven useEffect

## Problem

On `/users/sign-in`, selecting the "Log In" tab immediately snapped back to "New account". The control appeared broken — any tab selection by the user was instantly overwritten.

## Root Cause

`SignInTabs` used a `useEffect` that watched the entire Next.js `router` object and reset tab state on every run where `router.query.login` was not exactly `'true'`:

```tsx
// Before — SignInTabs.tsx
useEffect(() => {
  setTabValue(router.query.login === 'true' ? 1 : 0)
}, [router])
```

The Next.js Pages Router object is **not referentially stable** — it is replaced by a new reference on every rehydration cycle, shallow route, or internal app update, even when no navigation occurred and the query string did not change. This caused the effect to fire constantly. Because `login` was absent from the URL during normal browsing (only two specific callers ever set it), the condition evaluated to `false` on every re-run and forced the tab back to index 0, overwriting any tab the user had manually selected.

## Investigation

1. **`SignInTabs.tsx`** — confirmed that `useEffect([router])` was the direct cause. The `router` reference instability in Next.js Pages Router means the effect fires far more often than intended.

2. **What the tabs actually controlled** — the tabs were purely cosmetic for the first step of the sign-in flow. Real branching (new account vs. existing account) happens after email submission via `fetchSignInMethodsForEmail`. The tabs did not switch forms, routes, or pages.

3. **`AccountCheckDialog.tsx`** — the only two callers that ever set `login` in the query were `CreateJourneyButton` and `UseThisTemplateButton` via `AccountCheckDialog`. The `handleSignIn(login: boolean)` callback passed `true` for "Login with my account" and `false` for "Create a new account", appending `login: true/false` to the `router.push` query for `/users/sign-in`. Since tabs were cosmetic and did not affect identity verification, this pre-selection hint provided no functional value.

## Solution

### Step 1 — Remove the router sync from `SignInTabs.tsx`

Drop `useRouter`, `useEffect`, and the separate `handleTabChange` function. Tab state becomes pure local `useState(0)` with an inline `onChange` handler.

**Before:**

```tsx
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

export function SignInTabs(): ReactElement {
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)

  useEffect(() => {
    setTabValue(router.query.login === 'true' ? 1 : 0)
  }, [router])

  function handleTabChange(_event, newValue: number): void {
    setTabValue(newValue)
  }

  return (
    <Tabs value={tabValue} onChange={handleTabChange} ...>
```

**After:**

```tsx
import { ReactElement, useState } from 'react'

export function SignInTabs(): ReactElement {
  const [tabValue, setTabValue] = useState(0)

  return (
    <Tabs
      value={tabValue}
      onChange={(_, newValue) => {
        setTabValue(newValue)
      }}
      ...>
```

### Step 2 — Simplify `AccountCheckDialog` callback signature

Change `handleSignIn` from `(login: boolean) => void` to `() => void`. Both buttons now invoke it with no arguments.

**Before:**

```tsx
interface AccountCheckDialogProps {
  handleSignIn: (login: boolean) => void
}

// buttons
onClick={() => handleSignIn(true)}   // "Login with my account"
onClick={() => handleSignIn(false)}  // "Create a new account"
```

**After:**

```tsx
interface AccountCheckDialogProps {
  handleSignIn: () => void
}

// buttons
onClick={() => handleSignIn()}
onClick={() => handleSignIn()}
```

### Step 3 — Remove `login` from router push queries

In both `CreateJourneyButton.tsx` and `UseThisTemplateButton.tsx`, remove the `login` field from the `router.push` query object and the boolean parameter from `handleSignIn`.

**Before:**

```tsx
const handleSignIn = (login: boolean): void => {
  router.push({
    pathname: `${domain}/users/sign-in`,
    query: {
      redirect: url.includes('createNew') ? url : `${url}?createNew=true`,
      login: login ?? false
    }
  }, ...)
}
```

**After:**

```tsx
const handleSignIn = (): void => {
  router.push({
    pathname: `${domain}/users/sign-in`,
    query: {
      redirect: url.includes('createNew') ? url : `${url}?createNew=true`
    }
  }, ...)
}
```

### Step 4 — Update tests

- **`AccountCheckDialog` tests**: assert no-arg calls (`toHaveBeenCalledTimes(1)` without `toHaveBeenCalledWith` args). Add `beforeEach(() => handleSignIn.mockClear())` for test isolation.
- **`CreateJourneyButton` and `UseThisTemplateButton` tests**: remove `login: true` / `login: false` from expected `query` objects in all `router.push` assertions.

## Tradeoffs

The "Login with my account" button in `AccountCheckDialog` no longer pre-selects the "Log In" tab when landing on `/users/sign-in`. Previously, `login=true` in the URL initialized the tab to index 1. After this fix, the tab always starts at index 0 ("New account").

This is acceptable because:

- The tabs are cosmetic — they do not change the sign-in flow or identity verification path.
- The broken bounce-back behavior was worse UX than losing the pre-selection hint.
- Redirect behavior on sign-in completion is unchanged.

## Prevention Strategies

- **Depend on stable primitives, not the router object.** Destructure what you need: `const { login } = router.query`. Depending on the whole `router` in an effect is a footgun — the object reference changes constantly.
- **Prefer `useState` initializer over `useEffect` for query-driven defaults.** `useState(() => router.query.login === 'true' ? 1 : 0)` runs once and stays stable. A `useEffect` that resets state on every router reference change is an ongoing hazard.
- **Question every `useEffect` that writes to local state.** If the effect exists to "sync" state with something external, ask whether the state can simply be derived inline at render time or set once at mount.
- **Separate cosmetic UI state from routing logic.** If tabs do not gate routing, form submission, or data fetching, do not tie them to the router.
- **Audit `router.push` call sites before adding query params.** Every param you push becomes a potential `useEffect` trigger in child components. Only push params needed for deep-linking, back-navigation, or server-side logic.

## Warning Signs

- A `useEffect` with `[router]` (the whole object) in the dependency array.
- State-setter calls inside effects with a fallback reset (`setTab(condition ? 1 : 0)`) — the reset branch fires every re-run.
- Controlled MUI components (`<Tabs value={tab}>`) whose value is owned by an effect rather than stable prop or single `useState` initializer.
- Flicker or snap-back on tab/stepper selection that only occurs after a route transition, after login, or on first load after hydration — a classic symptom of SSR/rehydration causing an effect re-run with stale query state.
- `router.push` calls that append query params that a child component immediately reads in a `useEffect` — invisible producer/consumer coupling.

## Test Cases

**Stability of user selection**

- Render `<SignInTabs>`, click tab 1, then simulate a router reference change (fire `routeChangeComplete` or update the `useRouter` mock to return a new object with identical query). Assert `aria-selected` is still on tab 1.
- Render with `router.query = { login: 'true' }`, switch to tab 0 manually, then update mock router to a new object with the same query. Assert tab remains 0 (user's choice preserved).

**Caller contract**

- Unit-test `CreateJourneyButton`, `UseThisTemplateButton`, and `AccountCheckDialog` — assert `router.push` is not called with a `login` query param.

**Isolation from navigation events**

- Simulate a shallow route update (same page, different unrelated query param) — assert tab selection is unchanged.

## Best Practices: Next.js Pages Router + MUI Controlled Components

- The Pages Router object does **not** maintain referential stability. Never put `router` itself in a `useEffect` dependency array.
- Even individual query values can flicker during rehydration if the server rendered without them. Guard with `router.isReady` before using query params to initialise state.
- Use `useRouter` for reading current location and triggering navigation — not as a reactive data source for UI state.
- Controlled MUI components (`<Tabs>`, `<Stepper>`, `<Accordion>`, `<Select>`) trust their `value` prop absolutely. Any external write to the underlying state variable from an effect will override the user's selection with no warning. Prefer `defaultValue` for purely cosmetic widgets.
- If you find yourself writing a `useEffect` to "keep state in sync with X", first ask: can the component simply read X directly at render time? If yes, the effect is unnecessary complexity.

## Related

- [`docs/solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md`](../runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md) — same anti-pattern class: unstable effect dependency causes unexpected state resets. That fix uses a `useRef` to stabilize the dependency.
- [`docs/plans/2026-03-25-002-fix-invitation-link-team-redirect-plan.md`](../../plans/2026-03-25-002-fix-invitation-link-team-redirect-plan.md) — documents the safe alternative when router query reading _is_ required: capture once at mount via `useRef` + `window.location.search`, never via reactive `useEffect([router])`.
