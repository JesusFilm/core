import { ThemeOptions, createTheme } from '@mui/material'

export const baseSpacing: Required<Pick<ThemeOptions, 'spacing'>> = {
  spacing: [0, 4, 8, 16]
}

// Required to use baseSpacing in theme tokens
export const spacingTheme = createTheme(baseSpacing)
