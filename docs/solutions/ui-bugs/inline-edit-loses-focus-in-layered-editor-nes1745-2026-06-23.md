---
title: 'Inline text editing loses focus per keystroke in the single-page (LayeredView) editor'
date: 2026-06-23
ticket: NES-1745
category: ui-bugs
module: journeys-admin
component: journeys-admin/Editor/Slider/Content/Canvas
problem_type: 'ui_bug'
severity: medium
root_cause: logic_error
resolution_type: code_fix
status: resolved
tags:
  - inline-edit
  - focus-loss
  - poll-option
  - layeredview
  - nes-308
  - frameportal
  - handleselectcard
  - editor
symptoms:
  - 'Typing in a poll/multiselect option field loses focus after one character when the cursor is collapsed (no text highlighted); you must re-click after each keystroke'
  - 'With text highlighted (single-click selects all) the same field types fine'
  - 'Only nested option blocks (poll/multiselect options inside a question) break; one-level blocks (typography, button) are fine'
  - 'The editable input is removed from the DOM on the triggering interaction (confirmed via MutationObserver), i.e. the block is deselected and the editor unmounts'
---

# Inline text editing loses focus per keystroke in the single-page editor

> **Status: RESOLVED — root cause confirmed and fix verified in a live browser.**
> The fix is a one-line reducer change in `EditorProvider.tsx`
> (`SetSelectedBlockOnlyAction` must also update `selectedBlockId`). The earlier
> attempted fix (`d1b49d4c4`, a `handleSelectCard` guard) was wrong and has been
> reverted. See "Confirmed root cause" below; "Open questions" are now answered.

## Problem

In the journeys-admin editor on **desktop** (the NES-308 single-page `LayeredView`
layout), editing a **poll option** or **multiselect option** text label loses
focus after a single keystroke when the cursor is collapsed (you clicked to place
a cursor without highlighting text). The editable field is torn out of the DOM,
so you have to re-click the field for every character. One-level-deep blocks
(Typography, Button) are unaffected — only the _nested_ option blocks (which live
inside a Question block) break.

This is a **regression from PR #9297 (NES-308, commit `f8a3b9c49`)** "single-page
editor layout for desktop", which renders the canvas inside a MUI `Drawer`
(`LayeredView`) on desktop. Editing was fine before that landed.

## Symptoms

- Type one character with a collapsed cursor → field blurs / unmounts → must re-click.
- Highlighted text (single-click → `onFocus` selects all) types fine.
- Nested option blocks break; Typography/Button do not.
- MutationObserver shows the `input` element is **removed** from the DOM on the
  triggering interaction and not re-added — so it is a _deselect + unmount_, not a
  focus-steal or a key-churn remount.

## What didn't work (dead-ends — do not repeat)

1. **Removing `autoFocus` from the option editors (`RadioOptionEdit`,
   `MultiselectOptionEdit`).** Committed as `fdcc8a948` + `c005d6574`. This was a
   **wrong hypothesis** (autoFocus conflicting with the Modal focus trap).
   "Single-click works" only because highlighted text satisfies the deselect
   guard (see below), not because of autoFocus. These two commits are harmless
   redundant-prop cleanup (`inputRef={ref => ref.focus()}` already focuses on
   mount, like the working `TypographyEdit`) but **did not fix the bug** —
   consider reverting for honest history.
2. **`useOnClickOutside`** (`.../InlineEditWrapper/useOnClickOutside`) — dead
   code, no consumers. Not involved.
3. **Unstable `wrappers` causing remount** — ruled out; `Canvas.tsx` passes
   `wrappers={{ Wrapper: SelectableWrapper, RadioOptionWrapper: InlineEditWrapper, ... }}`
   using stable module-level component references.
4. **Key churn in the option list** — ruled out; `RadioQuestion` maps options
   with a stable `key={option.id}`.
5. **MUI `FocusTrap` stealing focus** — ruled out as the _primary_ cause; the
   `LayeredView` Modal already sets `disableEnforceFocus: true`, and the probe
   proved the input is _unmounted_, not blurred-in-place.

## Confirmed root cause (`SetSelectedBlockOnlyAction` desyncs `selectedBlockId`)

The deselect is **not** `handleSelectCard`. It is a stale-`selectedBlockId`
re-derivation, and the trigger is the keystroke itself, not the click.

`EditorState` keeps both `selectedBlock` (the `TreeBlock`) and `selectedBlockId`
(its id). The invariant `selectedBlockId === selectedBlock?.id` must hold, because
`SetStepsAction` rebuilds the block tree from the Apollo cache and re-derives the
selection **from `selectedBlockId`**:

```ts
case 'SetStepsAction': {
  const selectedBlock = state.selectedBlockId != null
    ? (searchBlocks(action.steps, state.selectedBlockId) ?? action.steps[0])
    : action.steps[0]
  // ...
}
```

NES-308 broke the invariant for the **layered** option re-select. When an
already-selected option is clicked again, `SelectableWrapper` dispatches
`SetSelectedBlockOnlyAction`, whose reducer case set **only** `selectedBlock`:

```ts
case 'SetSelectedBlockOnlyAction':
  return { ...state, selectedBlock: action.selectedBlock } // selectedBlockId NOT updated!
```

But during the same click's capture phase the parent question first dispatches
`SetSelectedBlockAction(question)`, which sets `selectedBlockId = question.id`. So
after the collapse-click: `selectedBlock` = option (editing works) but
`selectedBlockId` = **question** (stale). The first keystroke fires an optimistic
`radioOptionBlockUpdate` → cache write → `SetStepsAction` →
`searchBlocks(steps, question.id)` → selection snaps to the **question** →
`showEditable` for the option flips false → `RadioOptionEdit` unmounts → focus lost
after exactly one character.

Why highlighted works / collapsed breaks: a **fresh** select reaches the option via
`updateEditor` → `SetSelectedBlockAction` (sets `selectedBlockId` correctly, text
auto-highlights). Only the **re-select on an already-selected option** (the
collapse-click) goes through `SetSelectedBlockOnlyAction` and corrupts
`selectedBlockId`. Typography/Button never hit that branch.

### The fix

Keep the two in sync in the reducer:

```ts
case 'SetSelectedBlockOnlyAction':
  return {
    ...state,
    selectedBlockId: action.selectedBlock?.id, // <-- added
    selectedBlock: action.selectedBlock
  }
```

All three callers (`SelectableWrapper` option re-select, `Canvas`
`handleJourneyAppearanceClick`, `Slider.resetCanvasFocus`) pass a real block/step,
so syncing the id is strictly more correct everywhere. `d1b49d4c4`'s
`handleSelectCard` guard was reverted.

## Open questions — now answered (verified in a live browser via instrumented reducer logs + dual-document MutationObserver)

1. **Where does the editable input live?** The **iframe** (`FramePortal`), as the
   code implies. A DOM map showed all 9 `SelectableWrapper`s + the option
   `textarea` inside `iframe[0].contentDocument`; the main document held only the
   card-slug field and a react-flow checkbox. The prior "main document" reading was
   a misattribution (the page also has a second, Beacon iframe; `iframe.last()`
   pointed at the wrong one).
2. **Does `handleSelectCard` fire on the collapse-click?** **No.** Instrumentation
   showed it fires only when clicking **empty canvas** (React synthetic events
   bubble through the portal into the parent tree), never on a block/input click —
   `SelectableWrapper`'s `onClick` and the input's `onClick` both `stopPropagation`.
   So the collapse-click and the keystroke never reach `handleSelectCard`; the
   `d1b49d4c4` guard could not have helped.

## Diagnostic technique that worked (reusable)

Distinguish "remount/unmount" from "focus steal" by arming listeners _before_
interacting (so the console click does not blur the field), then typing:

```js
;(() => {
  window.__probeOff?.()
  const log = (...a) => console.log('[probe]', ...a)
  const onOut = (e) => log('focusOUT', e.target.tagName, '→', document.activeElement?.tagName)
  document.addEventListener('focusout', onOut, true)
  const hasInput = (n) => n.nodeType === 1 && (n.matches?.('input,textarea') || n.querySelector?.('input,textarea'))
  const obs = new MutationObserver((ms) =>
    ms.forEach((m) => {
      m.removedNodes.forEach((n) => hasInput(n) && log('REMOVED'))
      m.addedNodes.forEach((n) => hasInput(n) && log('ADDED'))
    })
  )
  obs.observe(document.body, { childList: true, subtree: true })
  window.__probeOff = () => {
    obs.disconnect()
    document.removeEventListener('focusout', onOut, true)
  }
  return 'armed'
})()
```

- `ADDED` then `REMOVED` (no auto re-add) = deselect/unmount (this bug).
- `focusOUT … → BODY` with no remove/add = focus steal (different fix).
- Note: a console-context gotcha — `document.activeElement` at paste-time is
  unreliable because focusing the console blurs the page; arm-then-interact avoids it.

## Prevention / notes

- `handleSelectCard`'s "keep editing only when text is highlighted" guard is
  fragile: placing a collapsed cursor is a normal editing action and must not
  deselect. Any canvas-level "click === deselect" handler should treat _focus
  inside an editable field_ as "still editing", not just _non-empty selection_.
- When a focused `<input>`/`<textarea>` "loses focus per keystroke", check for an
  **unmount** (parent deselect / conditional render flip) before chasing focus
  traps — the MutationObserver probe above settles it in seconds.
- The editor canvas is rendered inside an **iframe** (`FramePortal`); selection
  and `activeElement` checks must target the correct document. Confirm which
  document the editable nodes live in before writing document-scoped logic.

## Related work in the same PR (NES-1745 / #9326, all verified)

This branch also shipped (separately verified) drawer-refactor fixes worth knowing:

- **Secondary media drawers** (`ImageSource`, `VideoLibrary`, poster, host avatar):
  close the secondary drawer on select and skip the canvas refocus via a
  `shouldFocus` flag threaded into block create/update handlers, so the card no
  longer shifts. Undo/redo still refocus via explicit command `undo`/`redo`
  callbacks (use the `block` param's `id`, not the closure block, to satisfy
  TS narrowing inside the nested helper).
- **`LayeredView` coupling** (`settingsVisible = drawerOpen`): the card and its
  properties panel open/close together; this also fixed undo/redo landing on a
  card-without-properties state.
- **`LayeredView` overlay containment**: the drawer's MUI Modal renders into the
  journey-map container (`ModalProps.container` + `position: absolute`) so the
  dimmed backdrop stops at the app bar instead of covering the toolbar.
