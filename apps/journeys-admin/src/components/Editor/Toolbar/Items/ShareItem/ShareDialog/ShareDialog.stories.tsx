import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { publishedJourney } from '@core/journeys/ui/TemplateView/data'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { ApolloLoadingProvider } from '../../../../../../../test/ApolloLoadingProvider'

import { ShareDialog } from './ShareDialog'

const Demo: Meta<typeof ShareDialog> = {
  ...simpleComponentConfig,
  component: ShareDialog,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem/ShareDialog'
}

const Template: StoryObj<ComponentProps<typeof ShareDialog>> = {
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

export const Default = {
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

export const WithoutCustomDomain = {
  ...Template,
  args: {
    ...Default.args,
    hostname: undefined
  }
}

export const WithNullJourney = {
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

export default Demo
