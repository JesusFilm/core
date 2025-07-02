'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import {
  FontFamilies,
  ThemeMode,
  ThemeName,
  getTheme
} from '../../libs/themes/index'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  fontFamilies?: FontFamilies
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  rtl = false,
  locale = '',
  nested,
  fontFamilies
}: ThemeProviderProps): ReactElement => {
  const theme = getTheme({
    themeName,
    themeMode,
    rtl,
    locale,
    fontFamilies
  })

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
