import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
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
