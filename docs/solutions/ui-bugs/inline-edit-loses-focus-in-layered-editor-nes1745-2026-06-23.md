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
status: in-progress
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

> **Status: investigation in progress / fix UNVERIFIED.** This doc captures the
> decisions, dead-ends, and current best hypothesis for a hand-off. The latest
> commit on the branch (`d1b49d4c4`) is an *attempted* fix that the reporter says
> still does not work. Read "Open questions" before continuing.

## Problem

In the journeys-admin editor on **desktop** (the NES-308 single-page `LayeredView`
layout), editing a **poll option** or **multiselect option** text label loses
focus after a single keystroke when the cursor is collapsed (you clicked to place
a cursor without highlighting text). The editable field is torn out of the DOM,
so you have to re-click the field for every character. One-level-deep blocks
(Typography, Button) are unaffected — only the *nested* option blocks (which live
inside a Question block) break.

This is a **regression from PR #9297 (NES-308, commit `f8a3b9c49`)** "single-page
editor layout for desktop", which renders the canvas inside a MUI `Drawer`
(`LayeredView`) on desktop. Editing was fine before that landed.

## Symptoms

- Type one character with a collapsed cursor → field blurs / unmounts → must re-click.
- Highlighted text (single-click → `onFocus` selects all) types fine.
- Nested option blocks break; Typography/Button do not.
- MutationObserver shows the `input` element is **removed** from the DOM on the
  triggering interaction and not re-added — so it is a *deselect + unmount*, not a
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
5. **MUI `FocusTrap` stealing focus** — ruled out as the *primary* cause; the
   `LayeredView` Modal already sets `disableEnforceFocus: true`, and the probe
   proved the input is *unmounted*, not blurred-in-place.

## Current best hypothesis + attempted fix

The collapsed-vs-highlighted behaviour points squarely at `handleSelectCard` in
`apps/journeys-admin/src/components/Editor/Slider/Content/Canvas/Canvas.tsx`. It is
the `onClick` handler on the `EditorCanvas` stack and deselects the active block
back to the card unless text is highlighted:

```ts
const selectedText = iframeDocument?.getSelection()?.toString()
// keeps editing ONLY when text is highlighted:
if (selectedText != null && selectedText !== '' && !selectionRef.current) return
// ...otherwise:
dispatch({ type: 'SetSelectedBlockAction', selectedBlock: selectedStep }) // deselect
```

A collapsed cursor means `getSelection().toString() === ''`, so the guard does not
fire and the block is deselected → `showEditable` in `InlineEditWrapper.tsx`
(`selectedBlock?.id === block.id`) flips false → `RadioOptionEdit` unmounts.

**Attempted fix (`d1b49d4c4`, unverified):** also bail out when an inline input is
focused, regardless of selection:

```ts
const activeTag = iframeDocument?.activeElement?.tagName
if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') {
  resetClickOrigin()
  return
}
```

## Open questions (resolve these FIRST when continuing)

1. **Where does the editable input actually live — the card iframe or the main
   document?** `FramePortal`
   (`libs/journeys/ui/src/components/FramePortal/FramePortal.tsx`) `createPortal`s
   into the iframe's `contentDocument.body`, so blocks *should* be inside the
   iframe — which is why the existing guard reads `iframeDocument.getSelection()`.
   BUT the diagnostic MutationObserver, run on the **main** `document.body`, *saw*
   the input add/remove, implying the **main document**. This contradiction
   decides whether the new guard should read `iframeDocument.activeElement`
   (current) or `document.activeElement`. The attempted fix may simply be reading
   the wrong document.
2. **Does `handleSelectCard` even fire on the collapse-click?** It is a
   main-document `onClick`; clicks inside a same-origin iframe normally do not
   bubble to the parent. Put a breakpoint in `handleSelectCard` and confirm it
   runs on the collapse-click. If it does not, the real deselect is elsewhere —
   search for what dispatches `SetSelectedBlockAction` / `SetSelectedStepAction`
   or otherwise clears `selectedBlock` on a click or `selectionchange` while
   editing.

## Diagnostic technique that worked (reusable)

Distinguish "remount/unmount" from "focus steal" by arming listeners *before*
interacting (so the console click does not blur the field), then typing:

```js
;(() => { window.__probeOff?.()
  const log=(...a)=>console.log('[probe]',...a)
  const onOut=e=>log('focusOUT',e.target.tagName,'→',document.activeElement?.tagName)
  document.addEventListener('focusout',onOut,true)
  const hasInput=n=>n.nodeType===1&&(n.matches?.('input,textarea')||n.querySelector?.('input,textarea'))
  const obs=new MutationObserver(ms=>ms.forEach(m=>{m.removedNodes.forEach(n=>hasInput(n)&&log('REMOVED'));m.addedNodes.forEach(n=>hasInput(n)&&log('ADDED'))}))
  obs.observe(document.body,{childList:true,subtree:true})
  window.__probeOff=()=>{obs.disconnect();document.removeEventListener('focusout',onOut,true)}
  return 'armed' })()
```

- `ADDED` then `REMOVED` (no auto re-add) = deselect/unmount (this bug).
- `focusOUT … → BODY` with no remove/add = focus steal (different fix).
- Note: a console-context gotcha — `document.activeElement` at paste-time is
  unreliable because focusing the console blurs the page; arm-then-interact avoids it.

## Prevention / notes

- `handleSelectCard`'s "keep editing only when text is highlighted" guard is
  fragile: placing a collapsed cursor is a normal editing action and must not
  deselect. Any canvas-level "click === deselect" handler should treat *focus
  inside an editable field* as "still editing", not just *non-empty selection*.
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
