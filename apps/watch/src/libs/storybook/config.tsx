import { Story } from '@storybook/react'
import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

// Must set parameters at component level for shared-storybook stories to work
export const watchConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Story) => (
      <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
        <Story />
      </ThemeProvider>
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
