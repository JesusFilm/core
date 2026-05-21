---
title: 'Floating disclosure pattern with MUI in journeys-admin editor canvas'
category: design-patterns
date: 2026-05-21
problem_type: design_pattern
component: journeys-admin/Editor/Slider/JourneyFlow/TemplateInfoHelper
module: journeys-admin
severity: medium
applies_when:
  - 'Building a non-modal floating disclosure inside a ReactFlow canvas (helper, hint, info panel)'
  - 'Pairing two affordances in the same ReactFlow Panel slot via a context switch (template vs non-template, edit vs view, etc.)'
  - 'Composing MUI ClickAwayListener with Unstable_TrapFocus and Fade for keyboard-accessible overlays'
  - 'Adding internal scroll to an accordion list while keeping summary headers always visible'
tags:
  - mui
  - click-away
  - focus-trap
  - react-flow
  - accordion
  - react-19
  - inert
  - journeys-admin
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9235'
related_tickets:
  - NES-1642
  - NES-1538
---

# Floating disclosure pattern with MUI in journeys-admin editor canvas

## Context

When NES-1642 added a floating tutorial-info helper button to the journey editor canvas, the journeys-admin codebase had no precedent for any of the load-bearing primitives this pattern needs. Across `apps/journeys-admin/src`:

- Zero usages of `Unstable_TrapFocus`, `FocusTrap`, or any custom focus-trap helper
- No non-modal overlay anchored inside a ReactFlow `<Panel>` slot
- No prior pairing of two top-level canvas affordances behind a single Panel
- No precedent for the React 19 native `inert` attribute on a transitioning component

The closest analogue (`AnalyticsOverlaySwitch` + `JourneyAnalyticsCard` in `JourneyFlow.tsx`) wraps a Fade-animated card next to a switch — it has no trigger-disclosure mechanic, no focus management, and no click-away handling.

This doc captures the composition that landed in PR #9235 so the next floating-overlay-on-canvas task does not have to re-derive it.

## Guidance

### 1. Compose `ClickAwayListener` + `Unstable_TrapFocus` + `Fade` + `inert`

For a non-modal disclosure that opens above a trigger:

```tsx
const triggerRef = useRef<HTMLButtonElement>(null)
const panelId = useId()
const [open, setOpen] = useState(false)

return (
  <ClickAwayListener onClickAway={handleClickAway}>
    <Box sx={{ position: 'relative', width: 'fit-content' }}>
      <ButtonBase
        ref={triggerRef}
        aria-expanded={open}
        // aria-controls references the panel only while it is mounted;
        // Fade unmountOnExit removes the panel when closed, so an
        // unconditional reference would dangle for screen readers.
        aria-controls={open ? panelId : undefined}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
      >
        {/* trigger contents */}
      </ButtonBase>
      <Fade in={open} unmountOnExit>
        <Box
          id={panelId}
          inert={!open}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: (theme) => theme.zIndex.fab
          }}
        >
          <Unstable_TrapFocus open={open}>
            <Box tabIndex={-1}>{/* panel contents */}</Box>
          </Unstable_TrapFocus>
        </Box>
      </Fade>
    </Box>
  </ClickAwayListener>
)
```

Notes:

- `Unstable_TrapFocus` is imported from `@mui/material/Unstable_TrapFocus` — MUI marks it internal but it is the only stable export of the underlying `@mui/base` `FocusTrap` in `@mui/material@7.1.1`.
- The `<Box tabIndex={-1}>` wrapper is required so `FocusTrap` has a focusable root to land on while the user tabs through the panel contents.
- `width: 'fit-content'` on the outer Box keeps the trigger and panel layout the size of the trigger pill, so the absolute panel does not inherit a bogus width from its parent.

### 2. Return focus in a separate post-commit `useEffect` — not synchronously in `handleClose`

The naïve implementation calls `triggerRef.current?.focus()` inside `handleClose`:

```tsx
function handleClose(): void {
  setOpen(false)
  triggerRef.current?.focus() // ❌ races Unstable_TrapFocus's own restore
}
```

`Unstable_TrapFocus` runs its own focus restoration when `open` transitions to `false`. Its restore fires _after_ `Fade`'s ~225 ms exit transition completes. The synchronous `.focus()` lands first, then TrapFocus overwrites — focus can drop to `document.body` in real browsers. JSDOM tests pass because no transitions run, so the bug is invisible to unit tests.

The fix is to move the focus-return into a post-commit effect with a guard against initial mount:

```tsx
const wasOpenRef = useRef(false)

useEffect(() => {
  if (open) {
    wasOpenRef.current = true
    return
  }
  if (!wasOpenRef.current) return // do not steal focus on initial mount
  triggerRef.current?.focus()
}, [open])
```

The effect runs after React commits the `open=false` tree, putting our `.focus()` in the same tick as TrapFocus's restore. Whichever runs last wins; in practice both target the trigger so either order is fine.

### 3. Set `inert={!open}` to tab-isolate the Fade exit window

`Fade` with `unmountOnExit` keeps panel children in the DOM during the exit transition (~225 ms by default). `Unstable_TrapFocus` releases focus immediately on `open=false`, leaving the still-visible panel focusables tabbable. Without `inert`, a Tab press during that window can land focus on an element about to unmount.

React 19 supports `inert` as a native HTML boolean attribute. Pass it on the same Box that wraps the panel — when `open` is true the attribute is absent and the panel is fully interactive; when `open` is false the attribute is present and tab-stops inside are skipped until unmount.

### 4. Stable `panelId` via `useId()`, not a module-level constant

The trigger needs an `aria-controls` reference to the panel's `id`. Tempting to hardcode at module scope:

```tsx
const PANEL_ID = 'TemplateInfoHelperPanel' // ❌ collides if helper renders twice
```

If two helpers ever mount on the same page (rare but possible — side-by-side journey previews, for example), both share the same DOM id and ARIA wiring breaks silently. Use `useId()`:

```tsx
const panelId = useId()
```

### 5. Pair two ReactFlow `<Panel>` affordances via an inverse switch _inside_ one Panel

`@xyflow/react`'s `<Panel position="top-left">` has undefined behavior when two of them mount at the same position. The cleanest pattern for "templates get X, non-templates get Y" is a single Panel whose children switch on the gating condition:

```tsx
{
  /* outer gate: render the Panel only when one branch applies */
}
{
  shouldRenderTopLeftPanel && (
    <Panel position="top-left">
      {isTemplate ? (
        <TemplateInfoHelper />
      ) : (
        <>
          <AnalyticsOverlaySwitch />
          <Fade in={showAnalytics} unmountOnExit>
            <Box>
              <JourneyAnalyticsCard />
            </Box>
          </Fade>
        </>
      )}
    </Panel>
  )
}
```

The outer gate combines each branch's own conditions (e.g. `(isTemplate && featureFlagA) || (!isTemplate && featureFlagB)`) so the Panel does not render at all when neither branch qualifies. Both branches share the slot but each is independently flag-gated.

### 6. In-accordion scroll via `'& .MuiAccordionDetails-root'` descendant selector

For a contained panel whose accordion summaries must always stay visible while only the expanded section's body scrolls:

```tsx
<Box
  sx={{
    flex: '1 1 auto',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    '& .MuiAccordionDetails-root': {
      maxHeight: `max(${BODY_MIN_HEIGHT_PX}px, calc(100vh - ${RESERVATION_PX}px))`,
      overflowY: 'auto'
    }
  }}
>
  {accordions}
</Box>
```

The descendant selector (`& .MuiAccordionDetails-root`) targets the body of every accordion inside the wrapper. Collapsed accordions have a hidden body so the rule applies but has no visible effect. The expanded one gets a capped height with internal scroll. Summaries stay pinned because they live above `AccordionDetails` in MUI's internal structure.

**Do not reach for the direct-child selector (`& > .MuiAccordion-root`) — and a fragment vs. `<Box>` wrapper around the accordions makes no difference here.** An earlier round of NES-1642 used a nested flex chain with direct-child selectors, which fought MUI `Collapse`'s height-animation inline styles. The descendant-selector approach above is simpler and survives the wrapper. (CodeRabbit will sometimes flag the `<Box>` wrapper as breaking direct-child selectors — that is only true if you actually use direct-child selectors. With the descendant selector, the wrapper is benign.)

## Why This Matters

- **The composition is not obvious from MUI's docs.** Each primitive has its own docs page; the right way to chain them for a non-modal disclosure is not documented anywhere on the MUI site. NES-1642 had to discover the sequence (ClickAwayListener outer → Box positioning → Fade animation → inert tab-isolation → Unstable_TrapFocus focus management → `tabIndex=-1` wrapper).
- **JSDOM tests do not surface the focus race.** Any test suite that asserts focus return on Escape/click-away will pass while the production behavior is broken. The fix (effect-based focus return) is invisible from the test's perspective because both orderings produce the same final state in JSDOM — but in real browsers the timing matters.
- **`inert` is a React 19 native attribute.** Older React docs and many community examples still use `aria-hidden` or `pointer-events: none`. `inert` is the correct primitive for "this subtree is temporarily not interactive"; it covers both ARIA and tab-order semantics in one declaration.
- **The ReactFlow Panel pairing keeps a single source of truth for the slot.** Two separate `<Panel position="top-left">` instances would each individually decide whether to render, creating a class of bugs where both render or neither renders depending on the order of gates.

## When to Apply

- Building a floating overlay anchored to a trigger button on the editor canvas
- Adding context-switched affordances (template vs non-template, edit vs view, owner vs viewer) inside one ReactFlow Panel slot
- Composing keyboard-accessible non-modal disclosures with MUI primitives in journeys-admin

## Examples

The reference implementation lives in PR [#9235](https://github.com/JesusFilm/core/pull/9235):

- Helper component: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/TemplateInfoHelper/TemplateInfoHelper.tsx`
- Panel mount-site: `apps/journeys-admin/src/components/Editor/Slider/JourneyFlow/JourneyFlow.tsx` (around the `<Panel position="top-left">` block)
- In-accordion scroll: `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx` (the `contained` branch)

## Related

- [PR #9235](https://github.com/JesusFilm/core/pull/9235) — NES-1642 implementation
- [PR #9221](https://github.com/JesusFilm/core/pull/9221) — NES-1538, the shipped accordion panel reused by this pattern
- Sibling pattern doc: `docs/solutions/best-practices/viewport-relative-max-height-css-max-floor-nes1642.md`
- Sibling pattern doc: `docs/solutions/test-failures/mui-clickaway-listener-tests-use-userevent-nes1642.md`
