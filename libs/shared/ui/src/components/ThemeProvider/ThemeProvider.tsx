import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { ThemeMode, ThemeName, getTheme } from '../../libs/themes/index'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  rtl = false,
  locale = '',
  nested
}: ThemeProviderProps): ReactElement => {
  const theme = getTheme({ themeName, themeMode, rtl, locale })

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
