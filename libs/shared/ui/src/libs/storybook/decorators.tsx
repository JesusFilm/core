/* Storybook uses emotion v10, mui uses emotion v11 - force SB to
    use v11 as mui so theming works. 
    https://github.com/mui-org/material-ui/issues/24282

    TODO: Use mui ThemeProvider only when https://github.com/storybookjs/storybook/pull/13300 merged */
import { ThemeProvider } from 'emotion-theming'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material'
import { parameters as rootParameters } from '../../../../../../.storybook/preview'
import { themes } from '../../index'

// Must set parameters at component level for shared-storybook stories to work
export const sharedUiConfig = {
  decorators: [
    (Story: () => unknown) => (
      // TODO: Addon to allow changing themes
      <div style={{ margin: '0.5em' }}>
        <MuiThemeProvider theme={themes.light}>
          <ThemeProvider theme={themes.light}>
            <CssBaseline />
            {Story()}
          </ThemeProvider>
        </MuiThemeProvider>
      </div>
    )
  ],
  parameters: {
    ...rootParameters
  }
}
