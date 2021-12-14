import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../libs/storybook'
import { JourneyView } from './JourneyView'
import { defaultJourney, publishedJourney } from './data'
import { JourneyProvider } from './Context'

const JourneyViewStory = {
  ...journeysAdminConfig,
  component: JourneyView,
  title: 'Journeys-Admin/JourneyView',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={args.journey}>
      <JourneyView />
    </JourneyProvider>
  </MockedProvider>
)

export const Draft = Template.bind({})
Draft.args = {
  journey: defaultJourney
}

export const Published = Template.bind({})
Published.args = {
  journey: publishedJourney
}

export default JourneyViewStory as Meta
