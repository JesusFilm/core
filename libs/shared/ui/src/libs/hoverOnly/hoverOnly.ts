import { CSSObject } from '@mui/material/styles'

export interface HoverOnlyStyles {
  '@media (hover: hover)': {
    '&:hover': CSSObject
  }
}

/**
 * Wraps hover styles in `@media (hover: hover)` so they only paint on devices
 * with a real pointer.
 *
 * Touch browsers keep `:hover` on whatever the finger last touched and
 * synthesise mouse events at those coordinates. Because a card advance is a
 * client-side transition, whatever ends up under that point paints as hovered —
 * on a poll option that reads as "already selected". Guarding hover this way is
 * how the base theme has handled buttons since #1793; components that override
 * the theme with their own `&:hover` must use this helper or they reintroduce
 * the bug.
 *
 * Hybrid devices (an iPad with a trackpad, a touchscreen laptop) report
 * `hover: hover`, so a tap there can still leave a stale highlight. Accepted.
 *
 * Two hazards to know about, both silent:
 *
 * - The returned object's only key is `@media (hover: hover)`, so spreading two
 *   `hoverOnly()` results into the same style object makes the second replace
 *   the first. Merge the styles into a single call instead.
 * - Pairing this with a hand-written `&:hover` in the same object does *not*
 *   collide - the two keys differ, so both apply and the hand-written block
 *   stays unguarded. Route every hover style for an element through here.
 */
export function hoverOnly(styles: CSSObject): HoverOnlyStyles {
  return {
    '@media (hover: hover)': {
      '&:hover': styles
    }
  }
}
