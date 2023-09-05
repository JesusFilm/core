import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import mediaQuery from 'css-mediaquery'
import { ReactElement, ReactNode } from 'react'

import { ThemeMode, ThemeName, getTheme } from '../../libs/themes/index'

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  rtl?: boolean
  locale?: string
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
  // https://faisalman.github.io/ua-parser-js-docs/v2/api/ua-parser-js/get-device.html#type-string
  deviceType?: string
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  rtl = false,
  locale = '',
  nested,
  deviceType = 'desktop'
}: ThemeProviderProps): ReactElement => {
  // Should match baseBreakpoints
  const ssrMatchMedia = (query: string): { matches: boolean } => {
    return {
      matches: mediaQuery.match(query, {
        // The estimated CSS width of the browser.
        width:
          deviceType === 'mobile'
            ? '0px'
            : deviceType === 'tablet'
            ? '600px'
            : '1200px',
        height: deviceType === 'mobile' ? '0px' : '600px'
      })
    }
  }

  const theme = getTheme({ themeName, themeMode, rtl, locale, ssrMatchMedia })

  return (
    <MuiThemeProvider theme={theme}>
      {nested !== true && <CssBaseline />}
      {children}
    </MuiThemeProvider>
  )
}
