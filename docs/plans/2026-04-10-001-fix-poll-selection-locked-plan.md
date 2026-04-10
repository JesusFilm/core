---
title: 'fix: Allow users to change poll selection on RadioQuestion'
type: fix
status: completed
date: 2026-04-10
---

# fix: Allow users to change poll selection on RadioQuestion

## Overview

When a page contains one or more RadioQuestion poll blocks, clicking an option permanently locks the selection — all options (including the selected one) become disabled, and the user cannot change their answer without reloading the page. The fix removes the blanket `disabled` prop so users can freely change their poll selection.

## Problem Frame

After a user selects an option in a RadioQuestion (e.g., clicks "Yes" for "Dietary Restrictions"), they cannot select a different option in that same poll (e.g., "No"). The root cause is `RadioQuestion.tsx` line 204: `disabled={Boolean(selectedId)}`, which disables every option the moment any option is selected. This is problematic for polls (options with no navigation action) because the user remains on the page but cannot correct a mistake.

For options _with_ navigation actions, the disabling is irrelevant — `handleAction` navigates the user away immediately, and the `useEffect` resets `selectedId` to `null` when the block leaves the active history.

## Requirements Trace

- R1. Users can change their poll selection by clicking a different option
- R2. The previously selected option visually deselects when a new option is chosen
- R3. Analytics events (Plausible, GTM, submission mutation) fire on each selection change
- R4. Options with navigation actions continue to work correctly (navigate on click)
- R5. Selection still resets when navigating away from the block (existing `useEffect` behavior preserved)

## Scope Boundaries

- The `disabled` prop logic is removed and selected-state CSS is added — no changes to analytics, navigation, or state reset behavior
- No changes to editor/admin mode behavior (wrappers path is unaffected)

## Context & Research

### Relevant Code and Patterns

- `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx` — line 204: `disabled={Boolean(selectedId)}` is the root cause
- `libs/journeys/ui/src/components/RadioOption/RadioOption.tsx` — accepts `disabled` prop, defaults to `false`
- `libs/journeys/ui/src/libs/action/action.ts` — line 19: `if (action == null) return` — null-action re-clicks are safe
- `libs/journeys/ui/src/components/RadioOption/ListVariant/ListVariant.tsx` — MUI Button uses `disabled` prop; has `&.Mui-disabled` CSS but **no `&.selected` CSS rule** — the `className='selected'` is applied to the DOM but has no visual effect. Needs a `&.selected` rule added.
- `libs/journeys/ui/src/components/RadioOption/GridVariant/GridVariant.tsx` — has `&.selected` CSS with distinct background/border/boxShadow via `pollCustomTheme.selected`. Also has `&.Mui-disabled` for dimming overlay and text color. After fix, disabled overlay stops applying (correct — unselected options should look interactive).
- `libs/journeys/ui/src/components/RadioQuestion/utils/getPollOptionBorderStyles/getPollOptionBorderStyles.tsx` — border styles for default, hover, active, and disabled states. No `.selected` border state exists.

### Institutional Learnings

- `docs/solutions/runtime-errors/reactflow-multiple-usenodesstate-infinite-rerender.md` — analogous pattern: multiple instances sharing a handler must be scoped per-instance. Confirmed here: each RadioQuestion has isolated `useState`, so cross-poll interference is not the issue.

## Key Technical Decisions

- **Remove `disabled` entirely rather than conditionally**: The `disabled` prop was preventing re-selection. For poll options (null action), disabling is harmful. For action options, disabling is irrelevant (user navigates away). Therefore, simply removing the prop is the correct fix.
- **No guard against re-clicking the already-selected option**: Clicking the same option again fires another analytics event and re-calls `handleAction` (which no-ops for null actions). This is acceptable — the state doesn't change, and the extra analytics event is low-cost.

## Open Questions

### Resolved During Planning

- **Will removing `disabled` cause double-navigation for action-bearing options?** No — `handleAction` is idempotent for its action types (router.push, window.open, etc.), and the user navigates away on first click so re-click is not practically possible.
- **Does the GridVariant need changes?** No code changes — the `disabled` overlay and text dimming will stop applying because `disabled` will be `false`. The `&.selected` CSS class already provides sufficient visual differentiation.
- **Does the ListVariant need changes?** Yes — the ListVariant's `StyledListRadioOption` has no `&.selected` CSS rule. Without it, the selected option looks identical to unselected options. A `&.selected` rule must be added, following the GridVariant's pattern (distinct background, opacity, and text color).

### Deferred to Implementation

- None

## Implementation Units

- [ ] **Unit 1: Remove disabled prop from RadioQuestion and add selected styling to ListVariant**

**Goal:** Allow users to change their poll selection by removing the `disabled={Boolean(selectedId)}` logic and ensuring the selected option is visually distinct in both list and grid layouts.

**Requirements:** R1, R2, R4, R5

**Dependencies:** None

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx`
- Modify: `libs/journeys/ui/src/components/RadioOption/ListVariant/ListVariant.tsx`

**Approach:**

- In `RadioQuestion.tsx`, remove the `disabled={Boolean(selectedId)}` prop from the `<RadioOption>` element (line 204). Since `RadioOption` defaults `disabled` to `false`, omitting the prop is sufficient.
- In ListVariant's `StyledListRadioOption`, add a `&.selected` CSS rule following the GridVariant pattern: use a more prominent background color (matching the existing `&:active` press-state styling), full opacity, and appropriate text color to visually distinguish the selected option from unselected ones.

**Patterns to follow:**

- GridVariant's `&.selected` CSS in `StyledGridRadioOption` — uses `pollCustomTheme.selected` values for background, border, and boxShadow
- ListVariant's existing `&:active` CSS — the press-state styling is a natural basis for the persistent selected state

**Test scenarios:**
Test expectation: none — these are CSS/styling changes with no behavioral logic to unit-test. Visual correctness is verified via manual QA.

**Verification:**

- ListVariant selected option is visually distinct from unselected options (manual check)
- GridVariant selected option retains its existing `.selected` visual treatment

- [ ] **Unit 2: Update RadioQuestion tests for re-selection behavior**

**Goal:** Update tests to verify users can change their poll selection instead of being locked out.

**Requirements:** R1, R2, R3

**Dependencies:** Unit 1

**Files:**

- Modify: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.spec.tsx`

**Approach:**

- Replace the "should disable unselected options" test with a test that verifies a user can change their selection: click option 1, verify it is selected, click option 2, verify option 2 is now selected and option 1 is no longer selected. Both options should remain enabled throughout.
- Update the "should select an option onClick" test to remove the assertion that the button is disabled after click (line 147: `expect(buttons[0]).toBeDisabled()`), replacing it with a check that the button is NOT disabled.

**Patterns to follow:**

- Existing test patterns in `RadioQuestion.spec.tsx` — MockedProvider setup, blockHistoryVar, fireEvent.click

**Test scenarios:**

- Happy path: Click option 1 -> option 1 is selected and NOT disabled; click option 2 -> option 2 is selected, option 1 is deselected, both remain enabled
- Happy path: Click option 1 -> submission event mutation is called; click option 2 -> a second submission event mutation is called
- Edge case: Click option 1 twice -> option 1 remains selected, no errors

**Verification:**

- All existing RadioQuestion tests pass (with updated assertions)
- New test verifying selection change passes
- No regressions in RadioOption, ListVariant, or GridVariant tests

## System-Wide Impact

- **Interaction graph:** RadioOption's `onClick` -> RadioQuestion's `handleClick` -> `setSelectedId` + analytics mutations + `handleAction`. No change to this flow — just removing the disabled gate that prevented re-entry.
- **Error propagation:** No change — analytics mutations already use `void` (fire-and-forget).
- **State lifecycle risks:** None — `selectedId` is local component state, reset by existing `useEffect` on block history change.
- **API surface parity:** No other interfaces affected.
- **Unchanged invariants:** The `wrappers` code path (admin/editor mode, line 193-197) is unaffected — it renders `BlockRenderer` instead of `RadioOption` and does not pass `disabled`.

## Risks & Dependencies

| Risk                                                | Mitigation                                                                                          |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Multiple analytics events fired on selection change | Acceptable — each event represents a deliberate user action; mirrors how other form components work |

## Sources & References

- Linear ticket: [NES-975](https://linear.app/jesus-film-project/issue/NES-975/for-multiple-polls-in-a-page-selection-is-locked-user-cannot-change)
- Related code: `libs/journeys/ui/src/components/RadioQuestion/RadioQuestion.tsx:204`
