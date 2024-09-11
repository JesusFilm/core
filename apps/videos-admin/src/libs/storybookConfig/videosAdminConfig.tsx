import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles'
import { Decorator } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { ToggleColorMode } from '../../components/ToggleColorMode'
import { theme } from '../../theme'

export const videosAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (
      Story: Parameters<Decorator>[0],
      { parameters }: { parameters: { showThemeToggle?: boolean } }
    ) => {
      const { showThemeToggle } = parameters
      return (
        <SnackbarProvider>
          <MuiThemeProvider theme={theme}>
            {showThemeToggle != null && showThemeToggle && (
              <Box sx={{ p: 4 }}>
                <ToggleColorMode />
              </Box>
            )}
            <CssBaseline enableColorScheme />
            <Story />
          </MuiThemeProvider>
        </SnackbarProvider>
      )
    }
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    theme: 'dark'
  }
}
