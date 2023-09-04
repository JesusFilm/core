import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import mediaQuery from 'css-mediaquery'
import { ReactElement, ReactNode } from 'react'

import { getAdminLight } from './admin/theme'

interface ThemeProviderProps {
  children?: ReactNode
  // https://faisalman.github.io/ua-parser-js-docs/v2/api/ua-parser-js/get-device.html#type-string
  deviceType?: string
}

export function ThemeProvider({
  children,
  deviceType = 'desktop'
}: ThemeProviderProps): ReactElement {
  // Should match https://mui.com/material-ui/customization/breakpoints/#default-breakpoints unless we pass in custom breakpoints to this theme
  const ssrMatchMedia = (query: string): { matches: boolean } => ({
    matches: mediaQuery.match(query, {
      // The estimated CSS width of the browser.
      width:
        deviceType === 'mobile'
          ? '0px'
          : deviceType === 'tablet'
          ? '900px'
          : // Tablet landscape (lg), should use same layout as desktop (xl)
            '1200px'
    })
  })

  return (
    <MuiThemeProvider theme={getAdminLight(ssrMatchMedia)}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
