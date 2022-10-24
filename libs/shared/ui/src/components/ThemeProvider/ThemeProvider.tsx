import { ReactElement, ReactNode } from 'react'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeMode, ThemeName, getTheme } from '../../libs/themes/index'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  nested
}: ThemeProviderProps): ReactElement => {
  const theme = getTheme({ themeName, themeMode })

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
