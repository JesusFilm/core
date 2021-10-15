import { Breakpoints, Breakpoint, ThemeOptions } from '@mui/material'
import { createBreakpoints } from '@mui/system'

const minWidths: { [key in Breakpoint]: number } = {
  xs: 0, // Mobile (P)
  sm: 568, // Mobile (L)
  md: 768, // Tablet (P)
  lg: 1024, // Tablet (L)
  xl: 1200 // Laptop/Desktop
}

const minHeights: { [key in Breakpoint]: number } = {
  xs: 0,
  sm: 0,
  md: 600,
  lg: 600,
  xl: 600
}

const maxWidths: { [key in Breakpoint]: number } = {
  xs: minWidths.sm - 1,
  sm: minWidths.md - 1,
  md: minWidths.lg - 1,
  lg: minWidths.xl - 1,
  xl: 9999
}

const breakpointKeys = Object.keys(minWidths) as Breakpoint[]

// mui .up() only checks min-width.
// Use minHeight so large(960x540) Mobile (L) don't have Tablet (P) styling
const up = (key: Breakpoint | number): string => {
  const minWidth = typeof key === 'number' ? key : minWidths[key]
  const minHeight =
    typeof key === 'number'
      ? key < minWidths.md
        ? minHeights.sm
        : minHeights.md
      : minHeights[key]

  return `@media (min-width:${minWidth}px) and (min-height:${minHeight}px)`
}

// mui .only() only checks min-width and max-width
// Use minHeight so large(960x540) Mobile (L) don't have Tablet (P) styling
// Use maxHeight so small(768x1024) Tablet (P) don't have Mobile (L) styling
const only = (key: Breakpoint | number): string => {
  const minChecks = up(key)

  const maxWidth =
    typeof key === 'number'
      ? key + 1
      : // override for large Mobile (L) - now width overlaps Tablet (P)
      key === 'sm'
      ? 960
      : maxWidths[key]

  // Constrain height to distinguish between overlapping Mobile (L) & Tablet (P)
  // Could use orientation, but won't work for vertical desktops (edge case)
  const maxHeight =
    key === 'sm' || (key >= minWidths.sm && key < minWidths.md)
      ? maxWidths.xs
      : 9999

  return `${minChecks} and (max-width: ${maxWidth}px) and (max-height: ${maxHeight}px)`
}

const breakpoints: Breakpoints = createBreakpoints({
  values: minWidths,
  keys: breakpointKeys,
  unit: 'px',
  up,
  only,
  // Redundant when we have up & only
  down: undefined,
  between: undefined
})

export const baseBreakpoints: Required<Pick<ThemeOptions, 'breakpoints'>> = {
  breakpoints
}
