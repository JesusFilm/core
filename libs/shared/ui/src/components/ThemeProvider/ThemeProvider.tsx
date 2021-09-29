import { ReactElement, ReactNode } from 'react'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { themes } from '../../libs/themes/index'
import { ThemeName, ThemeMode } from '../../../__generated__/globalTypes'
import { ThemeProvider as EmotionTheming } from 'emotion-theming'

/* Storybook uses emotion v10, mui uses emotion v11 - force SB to
    use v11 as mui so theming works. 
    https://github.com/mui-org/material-ui/issues/24282

    TODO: Use muiThemeProvider only when https://github.com/storybookjs/storybook/pull/13300 merged */

interface ThemeProviderProps {
  children: ReactNode
  themeName: ThemeName
  themeMode: ThemeMode
  /** if nested ThemeProvider then CssBaseline should not be inserted */
  nested?: boolean
}

export const ThemeProvider = ({
  themeName,
  themeMode,
  children,
  nested
}: ThemeProviderProps): ReactElement => {
  const theme = themes[themeName][themeMode]

  return (
    <MuiThemeProvider theme={theme}>
      <EmotionTheming theme={theme}>
        {nested !== true && <CssBaseline />}
        {children}
      </EmotionTheming>
    </MuiThemeProvider>
  )
}
