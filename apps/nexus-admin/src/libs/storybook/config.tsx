import { Decorator } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { ThemeProvider } from '../../components/ThemeProvider'

// Must set parameters at component level for shared-storybook stories to work
export const nexusAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
      <SnackbarProvider>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </SnackbarProvider>
    )
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    theme: 'light'
  }
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  ...nexusAdminConfig,
  parameters: {
    ...nexusAdminConfig.parameters,
    chromatic: {
      ...nexusAdminConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}
