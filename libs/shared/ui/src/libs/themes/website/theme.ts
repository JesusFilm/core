import { deepmerge } from '@mui/utils'
import { createTheme } from '@mui/material/styles'
import { baseSpacing } from '../base/tokens/spacing'
import { websiteTypography } from './tokens/typography'
import { websiteComponents } from './tokens/components'
import { websiteColorsLight, websiteColorsDark } from './tokens/colors'

// TODO: Decide on more permanent website breakpoints
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true
  }
}

const websiteTheme = {
  ...baseSpacing,
  breakpoints: {
    values: {
      xs: 0, // Mobile (P)
      sm: 568, // Mobile (L)
      md: 600, // Tablet (P)
      lg: 961, // Tablet (L)
      xl: 1200, // Laptop
      xxl: 1400 // Desktop,
    }
  },
  ...websiteTypography,
  ...websiteComponents
}

export const websiteLight = createTheme(
  deepmerge(websiteColorsLight, websiteTheme)
)

export const websiteDark = createTheme(
  deepmerge(websiteColorsDark, websiteTheme)
)
