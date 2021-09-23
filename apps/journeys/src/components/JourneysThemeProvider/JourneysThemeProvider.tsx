import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { themes } from '@core/shared/ui'

import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

interface JourneysThemeProviderProps extends Pick<Journey, 'theme'> {
  children: ReactNode
}

export const JourneysThemeProvider = ({
  theme,
  children
}: JourneysThemeProviderProps): ReactElement => {
  return (
    <ThemeProvider theme={themes[theme]}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
