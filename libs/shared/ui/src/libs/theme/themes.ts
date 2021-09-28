import { createTheme } from '@mui/material/styles'
import { baseColorsLight, baseColorsDark } from './tokens/colors'
import { baseComponents } from './tokens/components'
import { baseSpacing } from './tokens/spacing'
// import { baseTypography } from './tokens/typography'

const baseTheme = createTheme({
  ...baseComponents,
  // ...baseTypography,
  ...baseSpacing
  // shape: { borderRadius: 8 }
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
