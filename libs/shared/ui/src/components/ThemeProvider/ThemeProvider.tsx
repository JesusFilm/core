import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { themes } from '../../libs/themes/index'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export function ThemeProvider({
  themeName,
  themeMode,
  children,
  nested
}: ThemeProviderProps): ReactElement {
  const theme = themes[themeName][themeMode]

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
