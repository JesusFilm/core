import { Story } from '@storybook/react'
import { sharedUiConfig } from '@core/shared/ui'
import { SnackbarProvider } from 'notistack'
import { ThemeProvider } from '../../components/ThemeProvider'

// Must set parameters at component level for shared-storybook stories to work
export const journeysAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Story) => (
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
  ...journeysAdminConfig,
  parameters: {
    ...journeysAdminConfig.parameters,
    chromatic: {
      ...journeysAdminConfig.parameters.chromatic,
      viewports: [1200]
    }
  }
}
