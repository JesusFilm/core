import { createTheme } from '@mui/material'
import { deepmerge } from '@mui/utils'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseBreakpoints } from './tokens/breakpoints'
import { baseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
import { baseTypography } from './tokens/typography'

export const baseTheme = {
  ...baseTypography,
  ...baseSpacing,
  ...baseComponents,
  ...baseBreakpoints
}

// DeepMerge no longer needed - remove or keep just in case for future?
export const baseLight = createTheme(deepmerge(baseColorsLight(), baseTheme))

export const baseDark = createTheme(deepmerge(baseColorsDark(), baseTheme))
