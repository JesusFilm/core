import { Decorator } from '@storybook/react'
import { SnackbarProvider } from 'notistack'

import algoliasearch from 'algoliasearch'
import { InstantSearch } from 'react-instantsearch'
import { ThemeProvider } from '../../components/ThemeProvider'
import { sharedUiConfig } from '../sharedUiConfig'
import { ThemeMode, ThemeName } from '../themes'

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY ?? ''
)

// Must set parameters at component level for shared-storybook stories to work
export const journeysAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0]) => (
      <SnackbarProvider>
        <ThemeProvider
          themeName={ThemeName.journeysAdmin}
          themeMode={ThemeMode.light}
        >
          <InstantSearch searchClient={searchClient}>
            <Story />
          </InstantSearch>
        </ThemeProvider>
      </SnackbarProvider>
    )
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    theme: 'light'
  }
}

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
          <InstantSearch searchClient={searchClient}>
            <Story />
          </InstantSearch>
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
      viewports: [600]
    }
  }
}
