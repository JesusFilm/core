import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { adminLight } from '@core/shared/ui/themes/journeysAdmin/theme'

interface ThemeProviderProps {
  children?: ReactNode
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export function ThemeProvider({
  children,
  nested
}: ThemeProviderProps): ReactElement {
  return (
    <MuiThemeProvider theme={adminLight}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
