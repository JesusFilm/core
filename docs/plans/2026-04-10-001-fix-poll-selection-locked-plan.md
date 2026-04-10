---
title: 'fix: Allow users to change poll selection on RadioQuestion'
type: fix
status: completed
date: 2026-04-10
---

# fix: Allow users to change poll selection on RadioQuestion

## Overview

When a page contains one or more RadioQuestion poll blocks, clicking an option permanently locks the selection — all options (including the selected one) become disabled, and the user cannot change their answer without reloading the page. The fix removes the blanket `disabled` prop, adds an early return to prevent duplicate analytics on same-option re-clicks, introduces a `dimmed` visual state for unselected options, and adds `&.selected` CSS to ListVariant for visual feedback.

## Problem Frame

After a user selects an option in a RadioQuestion (e.g., clicks "Yes" for "Dietary Restrictions"), they cannot select a different option in that same poll (e.g., "No"). The root cause is `RadioQuestion.tsx` line 204: `disabled={Boolean(selectedId)}`, which disables every option the moment any option is selected. This is problematic for polls (options with no navigation action) because the user remains on the page but cannot correct a mistake.

For options _with_ navigation actions, the disabling is irrelevant — `handleAction` navigates the user away immediately, and the `useEffect` resets `selectedId` to `null` when the block leaves the active history.

## Requirements Trace

- R1. Users can change their poll selection by clicking a different option
- R2. The previously selected option visually deselects when a new option is chosen
- R3. Analytics events (Plausible, GTM, submission mutation) fire on each selection change but not on same-option re-click
- R4. Options with navigation actions continue to work correctly (navigate on click)
- R5. Selection still resets when navigating away from the block (existing `useEffect` behavior preserved)
- R6. Unselected options are visually dimmed (greyed out but still clickable) when a selection exists

## Scope Boundaries

- The `disabled` prop logic is removed, selected/dimmed CSS is added — no changes to analytics logic beyond the early return guard
- No changes to editor/admin mode behavior (wrappers path is unaffected)

## Context & Research

### Relevant Code and Patterns

- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx` — `disabled={Boolean(selectedId)}` was the root cause
- `libs/journeys/ui/src/components/RadioOption/RadioOption.tsx` — accepts `disabled`, `selected`, and new `dimmed` props
- `libs/journeys/ui/src/libs/action/action.ts` — `if (action == null) return` — null-action re-clicks are safe
- `libs/journeys/ui/src/components/RadioOption/ListVariant/ListVariant.tsx` — MUI Button; added `&.selected` and `&.dimmed` CSS rules
- `libs/journeys/ui/src/components/RadioOption/GridVariant/GridVariant.tsx` — had `&.selected` CSS; added `&.dimmed` CSS and updated overlay/text to respond to dimmed state
- `libs/journeys/ui/src/components/RadioQuestion/utils/getPollOptionBorderStyles/getPollOptionBorderStyles.tsx` — border styles for default, hover, active, and disabled states

### Institutional Learnings

- `docs/solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md` — analogous pattern: multiple instances sharing a handler must be scoped per-instance. Confirmed here: each RadioQuestion has isolated `useState`, so cross-poll interference is not the issue.

## Key Technical Decisions

- **Remove `disabled` entirely rather than conditionally**: The `disabled` prop was preventing re-selection. For poll options (null action), disabling is harmful. For action options, disabling is irrelevant (user navigates away). Simply removing the prop is the correct fix.
- **Early return on same-option re-click**: `if (radioOptionBlockId === selectedId) return` prevents duplicate submission events and analytics inflation without blocking selection changes.
- **New `dimmed` prop instead of reusing `disabled`**: MUI's `disabled` prop blocks clicks. A separate `dimmed` prop applies the greyed-out visual styling (same colors as `&.Mui-disabled`) while keeping the button clickable, allowing users to change their selection.
- **Shared `activeSelectedColors` constant in ListVariant**: Extracted shared color tokens between `&:active` and `&.selected` to avoid duplication, following the GridVariant `pollCustomTheme` pattern.

## Open Questions

### Resolved During Planning

- **Will removing `disabled` cause double-navigation for action-bearing options?** No — `handleAction` is idempotent for its action types, and the user navigates away on first click.
- **Does the ListVariant need selected styling?** Yes — it had no `&.selected` CSS rule. Added one following GridVariant's pattern.
- **Will re-clicking the same option cause duplicate analytics?** Resolved by adding an early return guard in `handleClick`.

### Deferred to Implementation

- None — all questions resolved.

## Implementation Units

- [x] **Unit 1: Remove disabled prop and add selected/dimmed styling to ListVariant**

**Goal:** Allow users to change their poll selection by removing the `disabled={Boolean(selectedId)}` logic and adding visual feedback via `&.selected` and `&.dimmed` CSS rules.

**Requirements:** R1, R2, R6

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx`
- Modify: `libs/journeys/ui/src/components/RadioOption/ListVariant/ListVariant.tsx`

- [x] **Unit 2: Add early return guard for same-option re-click**

**Goal:** Prevent duplicate analytics events when re-clicking the already-selected option.

**Requirements:** R3

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx`

- [x] **Unit 3: Add dimmed prop to RadioOption and GridVariant**

**Goal:** Thread the `dimmed` prop through the component tree and apply dimmed visual treatment in GridVariant (overlay, text color, CSS class).

**Requirements:** R6

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioOption/RadioOption.tsx`
- Modify: `libs/journeys/ui/src/components/RadioOption/GridVariant/GridVariant.tsx`

- [x] **Unit 4: Update RadioQuestion and ListVariant tests**

**Goal:** Replace disabled-assertion tests with re-selection tests, add tests for selected/dimmed class application and early return guard.

**Requirements:** R1, R2, R3, R6

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.spec.tsx`
- Modify: `libs/journeys/ui/src/components/RadioOption/ListVariant/ListVariant.spec.tsx`

**Test scenarios covered:**

- Happy path: Click option 1 -> option 1 is selected and NOT disabled; click option 2 -> option 2 is selected, option 1 is deselected, both remain enabled
- Happy path: Click option 1 -> submission event fires; click option 2 -> second submission event fires
- Edge case: Click option 1 twice -> only one submission event fires (early return guard)
- Happy path: `selected={true}` applies `.selected` class to ListVariant
- Happy path: `selected={false}` does not apply `.selected` class
- Happy path: `dimmed={true}` applies `.dimmed` class to ListVariant
- Happy path: `dimmed={false}` does not apply `.dimmed` class
- Integration: Dimmed option is still clickable (not blocked by MUI disabled)

## System-Wide Impact

- **Interaction graph:** RadioOption's `onClick` -> RadioQuestion's `handleClick` -> early return if same option, else `setSelectedId` + analytics mutations + `handleAction`. The early return is the only new gate in the flow.
- **Error propagation:** No change — analytics mutations already use `void` (fire-and-forget).
- **State lifecycle risks:** None — `selectedId` is local component state, reset by existing `useEffect` on block history change.
- **API surface parity:** No other interfaces affected. The new `dimmed` prop is optional with `false` default, so all existing callers are unaffected.
- **Unchanged invariants:** The `wrappers` code path (admin/editor mode) is unaffected — it renders `BlockRenderer` instead of `RadioOption` and does not pass `disabled` or `dimmed`.

## Risks & Dependencies

| Risk                                                                          | Mitigation                                                                                                       |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Analytics events fire on each selection _change_ (not just first click)       | Acceptable — each change represents a deliberate user action. Same-option re-clicks are guarded by early return. |
| GridVariant disabled overlay code is now only reachable via editor/admin path | Pre-existing structural artifact. `disabled` prop still has legitimate use from admin `wrappers` path.           |

## Sources & References

- Linear ticket: [NES-975](https://linear.app/jesus-film-project/issue/NES-975/for-multiple-polls-in-a-page-selection-is-locked-user-cannot-change)
- PR: [JesusFilm/core#9003](https://github.com/JesusFilm/core/pull/9003)
- Related code: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx`
