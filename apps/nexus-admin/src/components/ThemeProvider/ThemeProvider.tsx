import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { adminLight } from './admin/theme'

interface ThemeProviderProps {
  children?: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  return (
    <MuiThemeProvider theme={adminLight}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
