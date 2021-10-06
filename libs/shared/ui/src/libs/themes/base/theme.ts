import { createTheme } from '@mui/material'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseSpacing } from './tokens/spacing'
import { baseTypography } from './tokens/typography'
import { baseComponents } from './tokens/components'
import { deepmerge } from '@mui/utils'

export const baseTheme = {
  ...baseTypography,
  ...baseSpacing,
  ...baseComponents
}

export const baseLight = createTheme(deepmerge(baseColorsLight, baseTheme))

export const baseDark = createTheme(deepmerge(baseColorsDark, baseTheme))
