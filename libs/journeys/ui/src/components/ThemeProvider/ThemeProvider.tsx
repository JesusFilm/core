import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { getUiDark, getUiLight } from './ui/theme'

enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

interface ThemeProviderProps {
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  children?: ReactNode
}

export function ThemeProvider({
  themeMode,
  rtl = false,
  locale = '',
  children
}: ThemeProviderProps): ReactElement {
  const theme =
    themeMode === ThemeMode.dark
      ? getUiDark(rtl, locale)
      : getUiLight(rtl, locale)

  return (
    <MuiThemeProvider theme={theme} data-testid="JourneysUiThemeProvider">
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
