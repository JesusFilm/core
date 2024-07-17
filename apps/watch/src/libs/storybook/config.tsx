import { Decorator } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

// TODO(jk): have moved this into shared ui, can I remove this one?

// Must set parameters at component level for shared-storybook stories to work
export const watchConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
      <SnackbarProvider>
        <ThemeProvider
          themeName={ThemeName.website}
          themeMode={ThemeMode.light}
        >
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
  parameters: {
    ...watchConfig.parameters,
    chromatic: {
      ...watchConfig.parameters.chromatic,
      viewports: [600]
    }
  }
}
