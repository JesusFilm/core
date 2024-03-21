import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { publishedJourney } from '../../../data'

import { ShareItem } from './ShareItem'

const ShareItemStory: Meta<typeof ShareItem> = {
  ...simpleComponentConfig,
  component: ShareItem,
  title: 'Journeys-Admin/Editor/Toolbar/Items/ShareItem'
}

const Template: StoryObj<typeof ShareItem> = {
  render: ({ ...args }) => (
    <ApolloLoadingProvider>
      <MockedProvider>
        <JourneyProvider
          value={{ journey: publishedJourney, variant: 'admin' }}
        >
          <Box
            sx={{
              p: 6,
              backgroundColor: 'background.paper'
            }}
          >
            <ShareItem {...args} />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    variant: 'button'
  }
}

export default ShareItemStory
