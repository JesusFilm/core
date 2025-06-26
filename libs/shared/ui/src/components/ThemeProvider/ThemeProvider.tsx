'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode, useMemo } from 'react'

import { ThemeMode, ThemeName, getTheme } from '../../libs/themes/index'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  fontFamilies?: {
    primaryFontFamily: string
    secondaryFontFamily: string
    accentFontFamily: string
  }
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
  const theme = useMemo(() => {
    return getTheme({
      themeName,
      themeMode,
      rtl,
      locale,
      fontFamilies
    })
  }, [themeName, themeMode, rtl, locale, fontFamilies])

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
