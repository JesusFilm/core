---
title: 'Viewport-relative max-height needs a max() floor'
category: best-practices
date: 2026-05-21
problem_type: best_practice
component: journeys-admin/TemplateInfoPanel
module: journeys-admin
severity: low
applies_when:
  - 'Sizing a floating panel relative to viewport height with calc(100vh - Npx)'
  - 'Constraining accordion bodies or scrollable regions to a viewport-derived budget'
  - 'Reserving editor chrome (toolbars, navbars) in a CSS height calculation'
tags:
  - css
  - viewport-units
  - max-height
  - calc
  - css-max
  - mui
  - responsive
  - journeys-admin
related_prs:
  - 'https://github.com/JesusFilm/core/pull/9235'
related_tickets:
  - NES-1642
---

# Viewport-relative max-height needs a max() floor

## Context

When sizing a floating panel or scrollable region relative to the viewport, the natural pattern is `calc(100vh - Npx)` where `Npx` reserves space for surrounding chrome (toolbar, navbar, sibling rows).

```css
max-height: calc(100vh - 620px);
```

This works fine on a normal desktop viewport. On a 600 px tall window, the calc resolves to `-20px`. CSS clamps negative `max-height` to `0` — the element becomes invisible with no warning. Tab-navigating into an invisible scroll region is painful to diagnose because devtools shows the element correctly sized at `0 × Npx`.

In NES-1642 this affected two CSS rules:

- The contained-mode `AccordionDetails` body in the floating helper (`calc(100vh - 620px)`)
- The chrome-less Drawer `AccordionDetails` body on the templates tab (`calc(100vh - 540px)`)

On any viewport smaller than the subtrahend, both rules silently collapsed.

## Guidance

Wrap viewport-relative `calc()` with CSS `max()` to guarantee a usable floor:

```css
max-height: max(80px, calc(100vh - 620px));
```

`max()` returns the *larger* of its arguments. On a 700 px viewport: `max(80, 80) = 80`. On a 1080 px viewport: `max(80, 460) = 460`. The floor (`80px` here) is whatever minimum scroll region keeps the UX functional — generally enough to show one or two lines of content plus the scroll thumb.

Pair it with named constants when the calc has more than one input:

```tsx
const CONTAINED_TOP_OFFSET_PX = 160
const CONTAINED_BODY_RESERVATION_PX = 620
const BODY_MIN_HEIGHT_PX = 80

// ...
sx={{
  maxHeight: `max(${BODY_MIN_HEIGHT_PX}px, calc(100vh - ${CONTAINED_BODY_RESERVATION_PX}px))`
}}
```

A docstring on the reservation constant should record the arithmetic (which chrome heights add up to the reservation) so a future toolbar resize is a one-place edit.

## Why This Matters

- **CSS clamps silently.** No console warning, no devtools red flag. The element simply disappears from layout.
- **The `0px` failure mode looks intentional.** When you inspect the element it shows `max-height: 0`, which a developer might read as "yeah, max-height is set, must be the content that is wrong" — wasting investigation time on the wrong layer.
- **The min-floor does not fix the underlying chrome budget.** On viewports tall enough to fall back to the floor, total panel content may still exceed the parent's `maxHeight` and clip surrounding chrome (e.g. a sticky close bar). The floor is a safety net, not a substitute for proper narrow-viewport layout. Document this in the constant's docstring so the next reader does not assume the floor handles mobile.

## When to Apply

- Any `max-height` or `height` value computed from `100vh - Npx`
- Container queries that derive heights from `cqh`, `vh`, `dvh`, etc., when `N` could exceed the unit
- Any time the reservation values are arithmetic sums (toolbar + header + footer) that could drift as those chrome heights change

## Examples

NES-1642 shipped this pattern in `apps/journeys-admin/src/components/TemplateInfoPanel/TemplateInfoPanel.tsx`, applied to the `AccordionDetails` body in both the contained-mode floating panel and the chrome-less Drawer surface (with different reservation constants for each context):

```tsx
sx={{
  '& .MuiAccordionDetails-root': {
    maxHeight: `max(${BODY_MIN_HEIGHT_PX}px, calc(100vh - ${CONTAINED_BODY_RESERVATION_PX}px))`,
    overflowY: 'auto'
  }
}}
```

The `CONTAINED_BODY_RESERVATION_PX = 620` docstring records the arithmetic:

> Total chrome within the contained panel: editor offset (160px) + panel header (~151px) + four accordion summary rows (~256px) + close bar (~52px) + dividers.

The Drawer surface uses `DRAWER_BODY_RESERVATION_PX = 540` with the same shape — different reservation because the Drawer context has its own surrounding chrome (page navbar/tabs instead of editor toolbar + close bar).

## Related

- [PR #9235](https://github.com/JesusFilm/core/pull/9235) — NES-1642 implementation
- Sibling pattern doc: `docs/solutions/design-patterns/floating-disclosure-mui-journeys-admin-canvas-nes1642.md`
