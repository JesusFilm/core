---
title: 'MUI ClickAwayListener tests need userEvent, not fireEvent'
category: test-failures
date: 2026-05-21
problem_type: test_failure
component: testing_framework
module: journeys-admin
severity: low
symptoms:
  - "ClickAwayListener test asserts panel closed but the element still shows aria-expanded='true'"
  - 'Test passes when written with userEvent.click but fails when copied to fireEvent.click'
  - 'outside-element click in JSDOM does not trigger onClickAway'
root_cause: async_timing
resolution_type: test_fix
tags:
  - mui
  - click-away
  - testing-library
  - user-event
  - fire-event
  - jsdom
  - journeys-admin
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9235'
related_tickets:
  - NES-1642
---

# MUI ClickAwayListener tests need userEvent, not fireEvent

## Problem

A test that opens a disclosure via `fireEvent.click(trigger)` and then attempts to dismiss it via `fireEvent.click(outsideElement)` fails: the disclosure stays open. The same test passes when switched to `userEvent.click()` for both interactions.

## Symptoms

- `expect(trigger).toHaveAttribute('aria-expanded', 'false')` fails — element still shows `'true'` after the outside click.
- The MUI `ClickAwayListener`'s `onClickAway` callback never fires for the outside-element click.
- Symptom is reproducible only with `fireEvent` from `@testing-library/react`; userEvent works.

## What Didn't Work

- **Switching the ClickAwayListener event from `onClick` to `onMouseDown`** — fired the listener at the wrong moment relative to the trigger button's own onClick, causing the click that opened the disclosure to also fire the click-away handler.
- **Adding `await waitFor(...)` around the assertion** — the listener never runs at all under `fireEvent`; no amount of waiting helps.
- **Wrapping the outside element in a `<div onClick={() => ...}>`** — confirmed the click event itself fires, ruling out event-propagation issues. The problem is specifically inside ClickAwayListener.

## Solution

Use `userEvent.click()` for both the trigger and the outside element:

```tsx
import userEvent from '@testing-library/user-event'

it('closes when clicking outside the helper and returns focus to the trigger', async () => {
  const user = userEvent.setup()
  render(
    <div>
      <button data-testid="outside">outside</button>
      <TemplateInfoHelper />
    </div>
  )

  const trigger = screen.getByTestId('TemplateInfoHelperTrigger')
  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')

  await user.click(screen.getByTestId('outside'))

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(trigger).toHaveFocus()
})
```

## Why This Works

MUI's `ClickAwayListener` deliberately defers attaching its document-level event listener by one tick after mount (via a `mountedRef`). The deferral exists so the very click that opened the disclosure does not immediately fire the click-away handler and close it.

`fireEvent.click()` dispatches the click synchronously and returns immediately — by the time the next tick fires (when ClickAwayListener finally attaches), the outside click is already history. The listener is registered but the event it cared about already passed.

`userEvent.click()` is async and includes natural microtask-yielding behavior (it dispatches `pointerdown`, `mousedown`, `pointerup`, `mouseup`, and `click` separately with awaits in between). By the time userEvent dispatches the actual `click`, ClickAwayListener has had time to register, and the listener fires correctly.

## Prevention

- **Default to `userEvent` for any test involving MUI overlays with click-away behavior** (Popover, Menu, ClickAwayListener directly). Bare `fireEvent.click` is a footgun.
- **Reach for `fireEvent.click` only for the simplest case**: clicking the trigger itself when the test does not depend on click-away handling. Even then, mixing fireEvent and userEvent in the same test is a maintenance trap — pick one and stick with it per test.
- If a test using fireEvent does not repro a click-away that works in production, suspect the timing issue before rewriting the production code or adjusting `mouseEvent` props on the listener.

## Related Issues

- [PR #9235](https://github.com/JesusFilm/core/pull/9235) — NES-1642, where this gotcha surfaced during U2's spec implementation
- Sibling pattern doc: `docs/solutions/design-patterns/floating-disclosure-mui-journeys-admin-canvas-nes1642.md`
