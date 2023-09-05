import { createTheme } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'

import { baseBreakpoints } from '../base/tokens/breakpoints'
import { baseSpacing } from '../base/tokens/spacing'

import { websiteColorsDark, websiteColorsLight } from './tokens/colors'
import { websiteComponents } from './tokens/components'
import { websiteTypography } from './tokens/typography'

const websiteTheme = {
  ...baseSpacing,
  ...baseBreakpoints,
  ...websiteTypography,
  ...websiteComponents
}

export const websiteLight = createTheme(
  deepmerge(websiteColorsLight, websiteTheme)
)

export const websiteDark = createTheme(
  deepmerge(websiteColorsDark, websiteTheme)
)
