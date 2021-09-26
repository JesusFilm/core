import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { themes } from '@core/shared/ui'
import { ThemeName } from '../../../__generated__/globalTypes'

interface JourneysThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
}

export const JourneysThemeProvider = ({
  themeName,
  children
}: JourneysThemeProviderProps): ReactElement => {
  return (
    <ThemeProvider theme={themes[themeName]}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
