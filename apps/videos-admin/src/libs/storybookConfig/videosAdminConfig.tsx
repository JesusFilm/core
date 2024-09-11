import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { Decorator } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { theme } from '../../theme'

export const videosAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
      <SnackbarProvider>
        <MuiThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          <Story />
        </MuiThemeProvider>
      </SnackbarProvider>
    )
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    theme: 'dark'
  }
}
