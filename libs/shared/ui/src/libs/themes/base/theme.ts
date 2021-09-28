import { createTheme } from '@mui/material'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
import { baseTypography } from './tokens/typography'

export const baseTheme = createTheme({
  ...baseTypography,
  ...baseSpacing,
  ...baseComponents
})

export const baseLight = createTheme({
  ...baseTheme,
  ...baseColorsLight
})

export const baseDark = createTheme({
  ...baseTheme,
  ...baseColorsDark
})
