import { Decorator } from '@storybook/nextjs'
import { SnackbarProvider } from 'notistack'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

// Must set parameters at component level for shared-storybook stories to work
export const apiUsersConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
      <SnackbarProvider>
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <Story />
        </ThemeProvider>
      </SnackbarProvider>
    )
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    layout: 'fullscreen'
  }
}

// Simple components are not responsive, simplify VR testing
export const simpleComponentConfig = {
  ...apiUsersConfig,
  parameters: {
    ...apiUsersConfig.parameters,
    chromatic: {
      ...apiUsersConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}
