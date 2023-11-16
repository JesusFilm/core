import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { publishedJourney } from '../../data'

import { JourneyLink } from './JourneyLink'

const JourneyLinkStory: Meta<typeof JourneyLink> = {
  ...simpleComponentConfig,
  component: JourneyLink,
  title: 'Journeys-Admin/JourneyView/JourneyLink'
}

const Template: StoryObj<typeof JourneyLink> = {
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
            <JourneyLink />
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

export default JourneyLinkStory
