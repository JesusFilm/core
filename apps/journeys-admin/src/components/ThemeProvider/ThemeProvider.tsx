import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { ReactElement, ReactNode } from 'react'
import { theme } from './theme'

interface ThemeProviderProps {
  children?: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
