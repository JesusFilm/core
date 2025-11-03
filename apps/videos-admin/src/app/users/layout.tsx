import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ReactElement, ReactNode } from 'react'

import { theme } from '../../theme'

export default function LocaleLayout({
  children
}: {
  children: ReactNode
}): ReactElement {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  )
}
