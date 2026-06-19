---
title: 'fix: Card template panel fails to reopen after dismissal'
type: fix
status: active
date: 2026-03-23
tickets: NES-1320, NES-225, ENG-1259
---

# fix: Card template panel fails to reopen after dismissal

## Overview

The "Card Templates" selection panel becomes permanently unavailable after being dismissed. This affects both desktop (navigating between empty cards) and mobile (pressing the "Select Card Template" button again). Three separate tickets describe the same root cause.

## Problem Statement

**Root cause:** `showCardTemplates` is local `useState(true)` in `Properties.tsx:119`. This state is initialized once when the component mounts and **never resets** when the user navigates to a different step or explicitly requests the templates panel via the mobile button.

**Git history context:** `showCardTemplates` was introduced in commit `caf9e457e` (May 2024, PR #2774 "fix: card templates close icon") as local state. It was never in EditorProvider. No prior fix attempts for the reopen bug exist.

**Affected flows:**

| Ticket   | Platform | Reproduction                                                                            |
| -------- | -------- | --------------------------------------------------------------------------------------- |
| NES-1320 | Desktop  | Close templates on Card A → navigate to empty Card B → templates don't appear           |
| NES-225  | Desktop  | Click between blank cards → card properties/templates alternate unpredictably           |
| ENG-1259 | Mobile   | Close templates via X → tap "Select Card Template" button again → shows card properties |

**Why local state fails:**

1. **Desktop navigation:** `SetSelectedStepAction` changes `selectedStep` in EditorProvider, but the local `useState` in Properties is unaware — it retains the stale `false` value.
2. **Mobile button:** `openCardTemplates` in CardWrapper dispatches `SetSelectedBlockAction` + `SetActiveSlideAction` but has **no way to communicate** with Properties' local state to reset `showCardTemplates`.
3. **Alternation bug (NES-225):** The `onClose` handler uses `setShowCardTemplates(!isCardTemplates)`, which toggles the value. Closing Card Templates sets `false`; closing Card Properties sets it back to `true`. This creates an unpredictable alternating pattern across card navigations.

### Why simpler alternatives don't work

| Alternative                                                       | Handles desktop? | Handles mobile? | Why it fails                                                                          |
| ----------------------------------------------------------------- | ---------------- | --------------- | ------------------------------------------------------------------------------------- |
| `useEffect(() => setShowCardTemplates(true), [selectedStep?.id])` | Yes              | **No**          | Mobile button doesn't change `selectedStep` — same step, so effect never fires        |
| `<Properties key={selectedStep?.id} />`                           | Yes              | **No**          | Same step = same key = no remount. Also discards all other local state on step change |
| Callback prop from Properties to CardWrapper                      | N/A              | N/A             | Components are in entirely different branches of the tree — impractical               |

## Proposed Solution

Lift `showCardTemplates` from local `useState` in Properties into the EditorProvider reducer. This is the minimum correct solution — it creates a single source of truth that both Properties (close) and CardWrapper (open) can read/write through the existing dispatch mechanism.

**Pattern precedent:** `SetShowAnalyticsAction` (EditorProvider line 145) is a direct analogue — a boolean "show" toggle on EditorState. Same pattern used by `SetHoveredStepAction` (Sep 2025).

### Key behaviors

1. `showCardTemplates` defaults to `true`
2. Resets to `true` on `SetSelectedStepAction` and `SetSelectedStepByIdAction` (covers desktop navigation)
3. Explicitly set to `true` by CardWrapper's `openCardTemplates` via new `SetShowCardTemplatesAction` (covers mobile button)
4. Set to `false` by Properties' `onClose` when dismissing the Card Templates panel
5. **Not** reset on `SetSelectedBlockAction` (re-clicking the same step should not force-reshow templates)
6. **Not** reset on `SetStepsAction` (indirect step changes from mutations shouldn't affect UI)

## Acceptance Criteria

- [ ] Navigating to a new empty card always shows the Card Templates panel, even if it was dismissed on the previous card
- [ ] On mobile, tapping "Select Card Template" after dismissing always reopens the Card Templates panel
- [ ] Clicking between multiple blank cards consistently shows Card Templates first (no alternation)
- [ ] Non-empty cards always show Card Properties (existing behavior preserved)
- [ ] Closing Card Templates on an empty card shows Card Properties (existing behavior preserved)
- [ ] Selecting a template populates the card and transitions to Card Properties (existing behavior preserved)
- [ ] Undo of template selection (card becomes empty) shows Card Templates panel
- [ ] All existing Properties and CardWrapper tests pass with updates
- [ ] New reducer tests cover `SetShowCardTemplatesAction`, reset on step change

## Implementation Plan

### Phase 1: EditorProvider state & reducer changes

**File:** `libs/journeys/ui/src/libs/EditorProvider/EditorProvider.tsx`

**1.1 Add `showCardTemplates` to `EditorState` interface (~line 34)**

```typescript
/**
 * showCardTemplates indicates whether the Card Templates panel should be
 * shown for empty cards. Resets to true on step navigation changes.
 */
showCardTemplates: boolean
```

**1.2 Define the new action interface (~line 156)**

```typescript
interface SetShowCardTemplatesAction {
  type: 'SetShowCardTemplatesAction'
  showCardTemplates: boolean
}
```

This follows the exact naming convention of `SetShowAnalyticsAction` (line 145).

**1.3 Add to `EditorAction` union type (~line 175)**

Add `SetShowCardTemplatesAction` to the union.

**1.3b Clean up duplicate union member**

Remove the duplicate `SetSelectedStepByIdAction` entry at line 191 of the union type (pre-existing issue).

**1.4 Add reducer case (~line 370, before the closing brace)**

```typescript
case 'SetShowCardTemplatesAction':
  return { ...state, showCardTemplates: action.showCardTemplates }
```

**1.5 Reset `showCardTemplates` in step-change actions**

In `SetSelectedStepAction` case (~line 248), add `showCardTemplates: true` to the returned state:

```typescript
case 'SetSelectedStepAction':
  return {
    ...state,
    selectedStepId: action.selectedStep?.id,
    selectedStep: action.selectedStep,
    selectedBlockId: action.selectedStep?.id,
    selectedBlock: action.selectedStep,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties,
    activeContent: ActiveContent.Canvas,
    showCardTemplates: true  // Reset: new step should show templates for empty cards
  }
```

Same for `SetSelectedStepByIdAction` case (~line 258). Add a brief comment noting that `SetEditorFocusAction` inherits this reset through delegation.

**Note on `SetEditorFocusAction` delegation:** `SetEditorFocusAction` (lines 310-369) recursively calls `reducer()` for `SetSelectedStepAction` and `SetSelectedStepByIdAction`. This means any `SetEditorFocusAction` that includes a step change will also reset `showCardTemplates`. This is correct — undo operations and step creation use `SetEditorFocusAction`, and they should reset the template panel for newly-empty cards.

**1.6 Set default values**

In `EditorContext` default (~line 377): add `showCardTemplates: true`

In `EditorProvider` `useReducer` initial state (~line 400): add `showCardTemplates: true`

**Note:** `SetShowCardTemplatesAction` does NOT need to be exported from `index.ts` — it is only dispatched within `Properties.tsx` and `CardWrapper.tsx`, both of which import `useEditor` and dispatch actions by type string. Only the `EditorAction` union type (already exported) needs to include it.

### Phase 2: Properties component changes

**File:** `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/Properties.tsx`

**2.1 Remove local `useState` (line 119)**

Delete: `const [showCardTemplates, setShowCardTemplates] = useState(true)`

**2.2 Read from editor state**

The component already destructures `state` and `dispatch` at line 118:

```typescript
const { state, dispatch } = useEditor()
```

Access `state.showCardTemplates` in the condition at line 130.

**2.3 Simplify `onClose` handler (line 194-203)**

Replace the toggle logic with explicit dispatch. Keep the `title === t('Card Templates')` check — it directly expresses "which panel am I closing?" and both `title` and the comparison use the same `t()` call in the same synchronous render:

```typescript
function onClose(): void {
  const isCardTemplates = title === t('Card Templates')

  if (isCardTemplates) {
    dispatch({
      type: 'SetShowCardTemplatesAction',
      showCardTemplates: false
    })
  } else {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: mdUp ? ActiveSlide.JourneyFlow : ActiveSlide.Content
    })
  }
}
```

**2.4 Clean up unused import**

Remove `useState` from the React import if no other local state uses it in this component.

### Phase 3: CardWrapper component changes

**File:** `apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/CardWrapper/CardWrapper.tsx`

**3.1 Add `SetShowCardTemplatesAction` dispatch to `openCardTemplates`**

```typescript
const openCardTemplates = (e: MouseEvent): void => {
  e.stopPropagation()
  dispatch({
    type: 'SetShowCardTemplatesAction',
    showCardTemplates: true
  })
  dispatch({
    type: 'SetSelectedBlockAction',
    selectedBlock: selectedStep
  })
  dispatch({
    type: 'SetSelectedAttributeIdAction',
    selectedAttributeId: undefined
  })
  dispatch({
    type: 'SetActiveSlideAction',
    activeSlide: ActiveSlide.Drawer
  })
}
```

**Dispatch ordering note:** `SetSelectedBlockAction` sets `activeSlide: Content` as a side effect (reducer line 225). `SetActiveSlideAction(Drawer)` must come last to override this. The inline comment in the code snippet documents this dependency. React 18 batches all four dispatches into a single re-render.

### Phase 4: Test updates

**4.1 EditorProvider reducer tests**

**File:** `libs/journeys/ui/src/libs/EditorProvider/EditorProvider.spec.tsx`

Add tests following existing patterns (direct `reducer()` calls with `toEqual`):

- `SetShowCardTemplatesAction` sets `showCardTemplates` to `true` / `false`
- `SetSelectedStepAction` resets `showCardTemplates` to `true`
- `SetSelectedStepByIdAction` resets `showCardTemplates` to `true`
- `SetEditorFocusAction` with `selectedStep` resets `showCardTemplates` to `true` (inherited from delegation)
- Verify `SetSelectedBlockAction` does **not** reset `showCardTemplates`

**4.2 Properties component tests**

**File:** `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/Properties.spec.tsx`

Update existing tests:

- Tests that previously relied on local `useState` toggling now verify dispatched actions via `TestEditorState`
- Add test: closing Card Templates dispatches `SetShowCardTemplatesAction(false)`
- Add test: with `showCardTemplates: false` in EditorProvider `initialState`, empty card shows Card Properties
- Add test: with `showCardTemplates: true` in EditorProvider `initialState`, empty card shows Card Templates
- Remove any tests that directly tested the local `useState` toggle behavior

**4.3 CardWrapper component tests**

**File:** `apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/CardWrapper/CardWrapper.spec.tsx`

- Add test: clicking "Select Card Template" button dispatches `SetShowCardTemplatesAction(true)`
- Verify via `TestEditorState` that `showCardTemplates` is `true` after button click

**4.4 TestEditorState helper**

**File:** `apps/journeys-admin/src/libs/TestEditorState/TestEditorState.tsx`

Add a line to render `showCardTemplates` (use `String()` since boolean `false` renders as empty in JSX):

```typescript
<div>showCardTemplates: {String(state.showCardTemplates)}</div>
```

## Edge Cases Considered

| Edge Case                                     | Behavior                         | Why                                                                                                                                                                                                                                   |
| --------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Re-click same step after dismissing templates | Card Properties stays (no reset) | `useStepAndBlockSelection` dispatches `SetSelectedBlockAction`, not `SetSelectedStepAction`, for same-step clicks                                                                                                                     |
| Undo template selection (card becomes empty)  | Card Templates reappear          | Undo dispatches `SetEditorFocusAction` → `SetSelectedStepByIdAction` → resets `showCardTemplates: true`                                                                                                                               |
| Remove all blocks from card manually          | Card Properties stays            | No step change occurs; `showCardTemplates` retains current value. Navigate away and back to see templates                                                                                                                             |
| `SetStepsAction` changes selected step        | No reset                         | Indirect step change from mutations; not user navigation                                                                                                                                                                              |
| `SetEditorFocusAction` with step              | Resets to `true`                 | Delegates to `SetSelectedStepAction` internally                                                                                                                                                                                       |
| Non-empty card navigation                     | Card Properties shown            | `card.children.length > 0` short-circuits before `showCardTemplates` is checked                                                                                                                                                       |
| Recursive `<Properties block={card}>` call    | `showCardTemplates` irrelevant   | Inner instance receives CardBlock, not StepBlock — the StepBlock guard doesn't match                                                                                                                                                  |
| `showAnalytics: true` + mobile button         | Button unreachable               | `SetActiveSlideAction` reducer (line 211) forces `activeSlide` to `0` when analytics are visible, silently overriding `Drawer`. Safe because analytics overlay hides the card preview and template button. **Verify during testing.** |

## Files to Modify

| File                                                                                                     | Change                                                                               |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `libs/journeys/ui/src/libs/EditorProvider/EditorProvider.tsx`                                            | Add `showCardTemplates` to state, action, reducer; clean up duplicate union member   |
| `libs/journeys/ui/src/libs/EditorProvider/EditorProvider.spec.tsx`                                       | Add reducer tests                                                                    |
| `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/Properties.tsx`      | Replace `useState` with editor state, simplify `onClose` toggle to explicit branches |
| `apps/journeys-admin/src/components/Editor/Slider/Settings/CanvasDetails/Properties/Properties.spec.tsx` | Update tests for new dispatch pattern                                                |
| `apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/CardWrapper/CardWrapper.tsx`            | Add `SetShowCardTemplatesAction` dispatch with ordering comment                      |
| `apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/CardWrapper/CardWrapper.spec.tsx`       | Add test for new dispatch                                                            |
| `apps/journeys-admin/src/libs/TestEditorState/TestEditorState.tsx`                                       | Add `showCardTemplates` rendering                                                    |

## Sources

- NES-1320: https://linear.app/jesus-film-project/issue/NES-1320
- NES-225: https://linear.app/jesus-film-project/issue/NES-225
- ENG-1259: https://linear.app/jesus-film-project/issue/ENG-1259
- Original `showCardTemplates` introduction: commit `caf9e457e` (May 2024, PR #2774)
- React 18 automatic batching: https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching
- React useReducer + Context pattern: https://react.dev/learn/scaling-up-with-reducer-and-context
