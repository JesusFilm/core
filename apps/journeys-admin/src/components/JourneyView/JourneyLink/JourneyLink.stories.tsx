import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import {
  JourneyProvider,
  RenderLocation
} from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
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
      <JourneyProvider
        value={{ journey: args.journey, renderLocation: RenderLocation.Admin }}
      >
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
