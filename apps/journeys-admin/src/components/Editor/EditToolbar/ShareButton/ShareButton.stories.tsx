import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { publishedJourney } from '../../data'

import { ShareButton } from './ShareButton'

const ShareButtonStory: Meta<typeof ShareButton> = {
  ...simpleComponentConfig,
  component: ShareButton,
  title: 'Journeys-Admin/JourneyView/ShareButton'
}

const Template: StoryObj<typeof ShareButton> = {
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
            <ShareButton />
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

export default ShareButtonStory
