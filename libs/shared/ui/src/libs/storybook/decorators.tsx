import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import { ThemeProvider } from '../../index'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { ReactElement } from 'react'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: () => ReactElement) => (
      // TODO: Addon to allow changing themes
      <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
        <Story />
      </ThemeProvider>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
