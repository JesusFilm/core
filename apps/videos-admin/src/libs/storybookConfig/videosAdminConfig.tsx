import CssBaseline from '@mui/material/CssBaseline'
import {
  ThemeProvider as MuiThemeProvider,
  useColorScheme
} from '@mui/material/styles'
import { Decorator, StoryContext } from '@storybook/react'
import { NextIntlClientProvider } from 'next-intl'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { theme } from '../../theme'

function StorySlot({
  storyComponent,
  storyContext
}: {
  storyComponent: ReactElement
  storyContext: StoryContext
}): ReactElement {
  const { setMode } = useColorScheme()
  setMode(storyContext.globals.theme ?? storyContext.parameters.theme)

  return <>{storyComponent}</>
}

export const videosAdminConfig = {
  ...sharedUiConfig,
  decorators: [
    (Story: Parameters<Decorator>[0], context: StoryContext) => {
      const {
        parameters: { locale = 'en' }
      } = context
      return (
        <NextIntlClientProvider locale={locale}>
          <SnackbarProvider>
            <MuiThemeProvider theme={theme}>
              <CssBaseline enableColorScheme />
              <StorySlot storyComponent={<Story />} storyContext={context} />
            </MuiThemeProvider>
          </SnackbarProvider>
        </NextIntlClientProvider>
      )
    }
  ],
  parameters: {
    ...sharedUiConfig.parameters,
    theme: 'dark'
  }
}
