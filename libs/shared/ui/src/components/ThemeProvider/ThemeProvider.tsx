import { ReactElement, ReactNode } from 'react'
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { themes } from '../../libs/themes/index'

export enum ThemeMode {
  dark = 'dark',
  light = 'light'
}

export enum ThemeName {
  base = 'base'
}

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  rtl,
  nested
}: ThemeProviderProps): ReactElement => {
  const theme = themes[themeName][themeMode]
  const newTheme = createTheme(
    {
      ...theme,
      direction: 'rtl'
    }
  )

  return (
    <MuiThemeProvider
      theme={newTheme}
    >
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
