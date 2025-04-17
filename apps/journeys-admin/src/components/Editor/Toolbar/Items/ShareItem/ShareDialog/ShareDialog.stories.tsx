import Box from '@mui/material/Box'
import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../../../../../test/ApolloLoadingProvider'

import { ShareDialog } from './ShareDialog'

const ShareDialogStory: Meta<typeof ShareDialog> = {
  ...simpleComponentConfig,
  component: ShareDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/ShareDialog'
}

const Template: StoryObj<typeof ShareDialog> = {
  render: (args) => (
    <ApolloLoadingProvider>
      <JourneyProvider value={{ journey: publishedJourney, variant: 'admin' }}>
        <Box sx={{ p: 6, backgroundColor: 'background.paper' }}>
          <ShareDialog {...args} />
        </Box>
      </JourneyProvider>
    </ApolloLoadingProvider>
  )
}

export const Default: StoryObj<typeof ShareDialog> = {
  ...Template,
  args: {
    open: true,
    onClose: action('onClose'),
    hostname: 'my.custom.domain',
    onSlugDialogOpen: action('onSlugDialogOpen'),
    onEmbedDialogOpen: action('onEmbedDialogOpen'),
    onQrCodeDialogOpen: action('onQrCodeDialogOpen')
  }
}

export const WithoutCustomDomain: StoryObj<typeof ShareDialog> = {
  ...Template,
  args: {
    ...Default.args,
    hostname: undefined
  }
}

export const WithNullJourney: StoryObj<typeof ShareDialog> = {
  ...Template,
  render: (args) => (
    <ApolloLoadingProvider>
      <JourneyProvider value={{ journey: undefined, variant: 'admin' }}>
        <Box sx={{ p: 6, backgroundColor: 'background.paper' }}>
          <ShareDialog {...args} />
        </Box>
      </JourneyProvider>
    </ApolloLoadingProvider>
  ),
  args: {
    ...Default.args
  }
}

export default ShareDialogStory
