import { deepmerge } from '@mui/utils'
import { createTheme, responsiveFontSizes } from '@mui/material/styles'
import { baseBreakpoints } from '../base/tokens/breakpoints'
import { baseSpacing } from '../base/tokens/spacing'
import { websiteTypography } from './tokens/typography'
import { websiteComponents } from './tokens/components'
import { websiteColorsLight, websiteColorsDark } from './tokens/colors'

const websiteTheme = {
  ...baseSpacing,
  ...baseBreakpoints,
  ...websiteTypography,
  ...websiteComponents
}

const light = createTheme(deepmerge(websiteColorsLight, websiteTheme))
export const websiteLight = responsiveFontSizes(light)

const dark = createTheme(deepmerge(websiteColorsDark, websiteTheme))
export const websiteDark = responsiveFontSizes(dark)
