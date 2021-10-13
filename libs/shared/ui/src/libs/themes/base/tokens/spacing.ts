import { ThemeOptions, createTheme } from '@mui/material'

export const baseSpacing: Required<
  Pick<ThemeOptions, 'spacing' | 'breakpoints'>
> = {
  spacing: 4,
  breakpoints: {
    values: {
      xs: 0, // Mobile (P)
      sm: 568, // Mobile (L)
      md: 768, // Tablet (P)
      lg: 1024, // Tablet (L)
      xl: 1200 // Laptop/Desktop
    }
  }
}

// Required to use baseSpacing in theme tokens
export const spacingThemeToken = createTheme(baseSpacing)
