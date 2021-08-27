import { ReactElement } from 'react'
import { CssBaseline, ThemeProvider } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import theme from './Theme'

export interface JourneysThemeProviderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const JourneysThemeProvider = ({
  children
}: JourneysThemeProviderProps): ReactElement => {
  return (
    <ThemeProvider theme={theme.lightTheme}>
      <CssBaseline />
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      {children}
    </ThemeProvider>
  )
}
