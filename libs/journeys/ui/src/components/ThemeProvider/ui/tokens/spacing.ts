import { ThemeOptions, createTheme } from '@mui/material/styles'

export const uiSpacing: Required<Pick<ThemeOptions, 'spacing'>> = {
  spacing: 4
}

// Required to use baseSpacing in theme tokens
export const spacingThemeToken = createTheme(uiSpacing)
