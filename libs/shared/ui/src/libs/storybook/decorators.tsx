/* Storybook uses emotion v10, mui uses emotion v11 - force SB to
    use v11 as mui so theming works. 
    https://github.com/mui-org/material-ui/issues/24282

    TODO: Use mui ThemeProvider when https://github.com/storybookjs/storybook/pull/13300 merged */
import { ThemeProvider } from "emotion-theming";
import { parameters as rootParameters } from "../../../../../../.storybook/preview";
import { lightTheme } from "../theme/theme";

// Must set parameters at component level for shared-storybook stories to work
export const journeysConfig = {
  decorators: [
    (Story) => (
      // TODO: Addon to allow changing themes
      <div style={{ margin: "3em" }}>
        <ThemeProvider theme={lightTheme}>
          <Story />
        </ThemeProvider>
      </div>
    ),
  ],
  parameters: {
    ...rootParameters,
  },
};
