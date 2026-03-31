---
title: "fix: Custom chat widget clears URL and icon on deselect"
type: fix
status: active
date: 2026-03-31
linear: NES-1522
---

# fix: Custom chat widget clears URL and icon on deselect

## Enhancement Summary

**Deepened on:** 2026-03-31
**Sections enhanced:** 4
**Research agents used:** Frontend races reviewer, TypeScript reviewer, Code simplicity reviewer, Pattern recognition specialist, Performance oracle, Framework docs researcher, Git history analyzer, ReactFlow learning check

### Key Improvements
1. Replaced `useEffect` sync with render-time state reset — eliminates the double-render anti-pattern flagged by React docs
2. Added ESLint compliance guidance — extract `chatButton?.id` to a local const
3. Documented the TextFieldForm Formik key interaction as a known amplification vector
4. Added verification that the shift case is handled without stale-state frames

### New Considerations Discovered
- The `useState` + `useEffect` sync pattern is explicitly called an anti-pattern by the React docs ("You Might Not Need an Effect")
- The `useEffect` approach causes a one-frame stale-state render before the effect fires — render-time reset eliminates this
- The `TextFieldForm` key pattern `key={field-${id}-${initialValue}}` amplifies any state change into a full Formik remount
- The `chatButton?.id` dependency is valid for `react-hooks/exhaustive-deps` but reading `chatButton.link`/`.platform` inside the effect without listing them as deps creates a stale closure risk

---

When a custom chat widget is unchecked and re-checked, the URL and icon selection are lost. Dedicated platforms (Facebook, WhatsApp, Telegram) retain their data. The root cause is a dynamic React `key` prop on custom `ChatOption` components that changes when the button is deleted, causing React to unmount/remount and destroy local state.

## Root Cause

In `Chat.tsx:119,129`, custom `ChatOption` components use:

```tsx
key={customButtons[0]?.id ?? 'custom-0'}
```

When the button is deleted from the server and Apollo cache:
1. `customButtons[0]` becomes `undefined`
2. The key changes from the button's ID (e.g. `"abc123"`) to the fallback `"custom-0"`
3. React unmounts the old component and mounts a new one
4. `useState` hooks in `ChatOption.tsx` reinitialize with empty defaults
5. The user's URL and icon are lost

Dedicated platforms have no `key` prop, so React preserves their component identity and state across re-renders.

### Research Insights

**React docs on keys** (react.dev/learn/preserving-and-resetting-state):
> "Specifying a key tells React to use the key itself as part of the component's position. Every time a component with a specific key appears on the screen, its state is created fresh. Every time it is removed, its state is destroyed."

**Git history**: The dynamic key pattern was introduced in PR #8865 (NES-1452, 2026-03-20) by jianwei1. A reviewer explicitly flagged the need for keys on the second custom slot. The key pattern exists specifically because `ChatOption` uses `useState` initializers that only run on mount.

## Acceptance Criteria

### Change 1: Stable keys in Chat.tsx

- [ ] `ChatOption` for custom slot 0 uses `key="custom-0"` (static)
- [ ] `ChatOption` for custom slot 1 uses `key="custom-1"` (static)

### Change 2: Render-time state reset in ChatOption.tsx

- [ ] Add render-time state reset that syncs `currentLink` and `currentPlatform` from `chatButton` prop
- [ ] Reset only fires when `chatButton?.id` changes (tracked via `trackedId` state)
- [ ] When `chatButton` is `undefined` (deselected), the guard prevents state reset — preserving the user's data
- [ ] When `chatButton` changes to a different button (shift case), state syncs to the new button's data immediately (no stale-state frame)
- [ ] No additional imports needed (`useEffect` not used)

### Change 3: Tests

- [ ] **ChatOption.spec.tsx** — add test: when `chatButton` prop changes to a different button (rerender), local state syncs to new button's link and platform
- [ ] **ChatOption.spec.tsx** — add test: when `chatButton` prop becomes `undefined` (rerender), local state is preserved (not reset)
- [ ] **Chat.spec.tsx** — verify existing tests still pass with stable keys (no functional change expected)

## Implementation

### ChatOption.tsx (Recommended: Render-Time State Reset)

```tsx
// apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/JourneyAppearance/Chat/ChatOption/ChatOption.tsx

import { ReactElement, useState } from 'react'
// ... existing imports

export function ChatOption({ ... }: ChatOptionProps): ReactElement {
  const [trackedId, setTrackedId] = useState(chatButton?.id)
  const [currentLink, setCurrentLink] = useState(chatButton?.link ?? '')
  const [currentPlatform, setCurrentPlatform] = useState(
    platform ?? chatButton?.platform ?? MessagePlatform.custom
  )

  // Sync local state when a different button shifts into this slot.
  // Runs during render (before commit) — no stale-state frame.
  // When chatButton is undefined (deselected), the guard preserves
  // local state so Summary.tsx can reuse it to re-create the button.
  if (chatButton != null && chatButton.id !== trackedId) {
    setTrackedId(chatButton.id)
    setCurrentLink(chatButton.link ?? '')
    setCurrentPlatform(chatButton.platform ?? MessagePlatform.custom)
  }

  return (
    // ... unchanged
  )
}
```

**Why render-time reset instead of useEffect:**

The React docs explicitly flag `useState` + `useEffect` prop sync as an anti-pattern (react.dev/learn/you-might-not-need-an-effect). The `useEffect` approach causes a double-render: one with stale state (before the effect fires), then another with correct state. The render-time pattern eliminates this — React processes the `setState` calls synchronously before committing, so children never see stale data.

Additionally, the `TextFieldForm` component uses `key={field-${id}-${initialValue}}`, which means any change to `initialValue` triggers a full Formik remount. With `useEffect`, this remount would happen twice per identity change (once with stale value, once with correct value). The render-time pattern avoids this.

### Chat.tsx

```tsx
// Line 118-119: Change dynamic key to stable key
<ChatOption
  key="custom-0"    // was: key={customButtons[0]?.id ?? 'custom-0'}
  chatButton={customButtons[0]}
  ...
/>

// Line 128-129: Change dynamic key to stable key
<ChatOption
  key="custom-1"    // was: key={customButtons[1]?.id ?? 'custom-1'}
  chatButton={customButtons[1]}
  ...
/>
```

### Alternative: useEffect approach (from original ticket)

If the team prefers the more familiar `useEffect` pattern (matching Label.tsx/Placeholder.tsx), this is the lint-safe version:

```tsx
const chatButtonId = chatButton?.id

useEffect(() => {
  if (chatButton != null) {
    setCurrentLink(chatButton.link ?? '')
    setCurrentPlatform(chatButton.platform ?? MessagePlatform.custom)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally sync only on identity change
}, [chatButtonId])
```

**Trade-off**: Simpler and more recognizable, but causes one stale-state render frame per identity change. Acceptable for a settings panel (not a performance-critical path).

## Verification Scenarios

| # | Scenario | Expected |
|---|----------|----------|
| A | 1 custom: deselect then re-select | URL and icon preserved |
| B | 2 customs: deselect first | Second button's data shifts into slot 1 correctly |
| C | 2 customs: deselect second | First button unchanged |
| D | Deselect then re-select then refresh page | Button re-created on server with preserved URL (verify via network or refresh) |
| E | Toggle dedicated platforms off and on | Regression check — unchanged behavior |

### Research Insights on Verification

**No Apollo-to-state race condition**: The mutation response, cache update, re-render, and state sync all happen within a single browser frame. There is no gap where the user could interact with stale state.

**Rapid toggle safety**: `Summary.tsx` has `createLoading || removeLoading` guards that prevent double-mutation from rapid clicking. User intent may be swallowed (they click uncheck during create loading, it blocks), but data is never corrupted.

**TextFieldForm interaction**: The Formik form uses `key={field-${id}-${initialValue}}` and `enableReinitialize`. When `currentLink` changes via the state reset, the Formik instance reinitializes correctly. No additional work needed.

## Context

- **Codebase pattern**: `useState` + `useEffect` prop-to-state sync is established in `Label.tsx:81-83` and `Placeholder.tsx:61-63` in the same editor area — but those sync on VALUE changes, not identity changes. The render-time reset pattern is closer to the React-recommended "adjusting state during render" approach.
- **Summary.tsx already passes `currentLink` and `currentPlatform`** to the create mutation (lines 72-73), so re-created buttons get the preserved values from local state
- **TextFieldForm uses `key={field-${id}-${initialValue}}`** internally, so it reinitializes correctly when `currentLink` changes via the state reset — but this also means any state change causes a full Formik remount (a known amplification vector)
- **React 18+ automatic batching**: Multiple `setState` calls in the render-time reset (or `useEffect`) are batched into a single re-render
- **No infinite re-render risk**: The `trackedId` tracking variable ensures the reset condition is false after the synchronous re-render, preventing loops

## Edge Cases Discovered During Research

| Edge Case | Impact | Handling |
|---|---|---|
| Server normalizes link (e.g. lowercases hostname) | Low — currently server returns link as-is | State reset would write back the normalized value. Add a comment documenting this assumption. |
| `chatButton` transitions from undefined to `{id: undefined}` | Negligible — IDs are always UUIDs in practice | `chatButton.id !== trackedId` → `undefined !== undefined` → false → no sync. Technically correct (no button identity change). |
| User types in TextFieldForm but hasn't submitted | Unsubmitted input exists only in Formik's internal state | Deselecting destroys the Formik instance. This is consistent with dedicated platforms — user must commit (blur/enter) before toggling. |
| External update to chatButton fields (e.g. Google Sync) | State not synced if ID unchanged | By design — syncing on value changes would overwrite local edits. The ID-based approach prioritizes local state preservation. |

## Sources

- Linear ticket: [NES-1522](https://linear.app/jesus-film-project/issue/NES-1522)
- Related (done): [NES-1452](https://linear.app/jesus-film-project/issue/NES-1452) — introduced the dynamic key pattern in PR #8865
- Existing sync pattern: `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/blocks/TextResponse/TextResponseFields/Label/Label.tsx:81-83`
- React docs: react.dev/learn/you-might-not-need-an-effect (adjusting state during render)
- React docs: react.dev/learn/preserving-and-resetting-state (key-based reset)
