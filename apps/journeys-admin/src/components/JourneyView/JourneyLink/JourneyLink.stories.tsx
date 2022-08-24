import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import { simpleComponentConfig } from '../../../libs/storybook'
import { publishedJourney } from '../data'
import { JourneyLink } from './JourneyLink'

const JourneyLinkStory = {
  ...simpleComponentConfig,
  component: JourneyLink,
  title: 'Journeys-Admin/JourneyView/JourneyLink'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={{ journey: args.journey }}>
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
)

export const Default = Template.bind({})
Default.args = {
  journey: publishedJourney
}

export default JourneyLinkStory as Meta
