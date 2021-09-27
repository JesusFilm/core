/* Storybook uses emotion v10, mui uses emotion v11 - force SB to
    use v11 as mui so theming works. 
    https://github.com/mui-org/material-ui/issues/24282

    TODO: Use mui ThemeProvider only when https://github.com/storybookjs/storybook/pull/13300 merged */
import { ThemeProvider as EmotionTheming } from 'emotion-theming'
import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import themes, { ThemeProvider } from '../../index'
import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'
import { ReactElement } from 'react'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: () => ReactElement) => (
      // TODO: Addon to allow changing themes
      <div style={{ margin: '0.5em' }}>
        <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
          <EmotionTheming theme={themes.base.light}>{Story()}</EmotionTheming>
        </ThemeProvider>
      </div>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
