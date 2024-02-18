import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { getTheme } from './admin/theme'

interface ThemeProviderProps {
  children?: ReactNode
  rtl?: boolean
}

export function ThemeProvider({
  children,
  rtl = false
}: ThemeProviderProps): ReactElement {
  const theme = getTheme({ rtl })

  return (
    <MuiThemeProvider theme={theme} data-testid="JourneysAdminThemeProvider">
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
