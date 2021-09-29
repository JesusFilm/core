import { ThemeOptions, createTheme } from '@mui/material'

export const baseSpacing: Required<Pick<ThemeOptions, 'spacing'>> = {
  spacing: 4
}

// Required to use baseSpacing in theme tokens
export const spacingTheme = createTheme(baseSpacing)
