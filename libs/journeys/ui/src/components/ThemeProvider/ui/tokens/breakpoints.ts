import { Breakpoint } from '@mui/material/styles'
// eslint-disable-next-line no-restricted-imports
import createBreakpoints, {
  BreakpointsOptions
} from '@mui/system/createTheme/createBreakpoints'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true
  }
}

const minWidths: { [key in Breakpoint]: number } = {
  xs: 0, // Mobile (P)
  sm: 568, // Mobile (L)
  md: 600, // Tablet (P)
  lg: 961, // Tablet (L)
  xl: 1200, // Laptop
  xxl: 1400 // Desktop
}

const minHeights: { [key in Breakpoint]: number } = {
  xs: 0,
  sm: 0,
  md: 600,
  lg: 600,
  xl: 600,
  xxl: 600
}

const maxWidths: { [key in Breakpoint]: number } = {
  xs: minWidths.sm - 1,
  sm: minWidths.md - 1,
  md: minWidths.lg - 1,
  lg: minWidths.xl - 1,
  xl: minWidths.xxl - 1,
  xxl: 9999
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
const only = (key: Breakpoint): string => {
  const minWidth = minWidths[key]
  const maxWidth = maxWidths[key]
  const minHeight = minHeights[key]

  const defaultBreakpointCheck = `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px) and (min-height:${minHeight}px)`

  // Enable larger mobiles(960x540) to keep SM breakpoint
  // Use max-height over orientation for storybook / chromatic checks
  const overlappingMobileCheck =
    key === 'sm'
      ? `(min-width: ${minWidths.md}px) and (max-width: 9999px) and (max-height: ${minHeights.md}px), `
      : ''

  return `@media ${overlappingMobileCheck}${defaultBreakpointCheck}`
}

type BaseBreakpoints = Required<
  Omit<BreakpointsOptions, 'between' | 'not' | 'step' | 'unit'>
>

const breakpoints: BaseBreakpoints = createBreakpoints({
  values: minWidths,
  keys: breakpointKeys,
  unit: 'px',
  up,
  only,
  // Redundant when we have up & only
  between: undefined
})

export const uiBreakpoints: { breakpoints: BaseBreakpoints } = {
  breakpoints
}
