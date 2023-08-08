import { MockedProvider } from '@apollo/client/testing'
import Box from '@mui/material/Box'
import { Meta, Story } from '@storybook/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { ApolloLoadingProvider } from '../../../../test/ApolloLoadingProvider'
import { simpleComponentConfig } from '../../../libs/storybook'
import { publishedJourney } from '../data'

import { JourneyLink } from './JourneyLink'

const JourneyLinkStory = {
  ...simpleComponentConfig,
  component: JourneyLink,
  title: 'Journeys-Admin/JourneyView/JourneyLink'
}

const Template: Story = ({ ...args }) => (
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

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export const Loading = Template.bind({})
Loading.args = {
  journey: undefined
}

export default JourneyLinkStory as Meta
