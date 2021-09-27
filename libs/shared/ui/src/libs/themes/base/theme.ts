import { createTheme } from '@mui/material'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseSpacing } from './tokens/spacing'
import { baseTypography } from './tokens/typography'

export const baseTheme = createTheme({
  ...baseTypography,
  ...baseSpacing
  // BUTTON TODO
})

export const baseLight = createTheme({
  ...baseTheme,
  ...baseColorsLight
})

export const baseDark = createTheme({
  ...baseTheme,
  ...baseColorsDark
})

// Add other themes
