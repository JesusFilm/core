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
 */
export function hoverOnly(styles: CSSObject): HoverOnlyStyles {
  return {
    '@media (hover: hover)': {
      '&:hover': styles
    }
  }
}
