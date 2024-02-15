import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../../libs/storybook'
import { publishedJourney } from '../../../data'

import { ShareButtonItem } from './ShareButtonItem'

const ShareButtonItemStory: Meta<typeof ShareButtonItem> = {
  ...simpleComponentConfig,
  component: ShareButtonItem,
  title: 'Journeys-Admin/JourneyView/ShareButtonItem'
}

const Template: StoryObj<typeof ShareButtonItem> = {
  render: ({ ...args }) => (
    <ApolloLoadingProvider>
      <MockedProvider>
        <JourneyProvider value={{ journey: args.journey, variant: 'admin' }}>
          <Box
            sx={{
              p: 6,
              backgroundColor: 'background.paper'
            }}
          >
            <ShareButtonItem />
          </Box>
        </JourneyProvider>
      </MockedProvider>
    </ApolloLoadingProvider>
  )
}

export const Default = {
  ...Template,
  args: {
    journey: publishedJourney
  }
}

export const Loading = {
  ...Template,
  args: {
    journey: undefined
  }
}

export default ShareButtonItemStory
