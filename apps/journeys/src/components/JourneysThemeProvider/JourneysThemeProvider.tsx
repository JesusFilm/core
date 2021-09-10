import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { lightTheme as theme } from '../../libs/themes/default'

interface JourneysThemeProviderProps {
  children: ReactNode
}

export const JourneysThemeProvider = ({
  children
}: JourneysThemeProviderProps): ReactElement => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
