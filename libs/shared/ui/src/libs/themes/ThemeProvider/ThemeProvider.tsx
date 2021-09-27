import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import themes from '../index'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children
}: ThemeProviderProps): ReactElement => {
  return (
    <MuiThemeProvider theme={themes[themeName][themeMode]}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
