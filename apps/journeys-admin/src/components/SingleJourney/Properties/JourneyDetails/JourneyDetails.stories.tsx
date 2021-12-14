import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { JourneyDetails } from './JourneyDetails'
import { JourneyProvider } from '../../Context'
import { defaultJourney, publishedJourney } from '../../singleJourneyData'

const JourneyDetailsStory = {
  ...journeysAdminConfig,
  component: JourneyDetails,
  title: 'Journeys-Admin/SingleJourney/JourneyDetails'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyProvider value={args.journey}>
      <JourneyDetails {...args} />
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = {
  journey: defaultJourney
}

export const Publish = Template.bind({})
Publish.args = {
  journey: publishedJourney
}

export const PreviousYear = Template.bind({})
PreviousYear.args = {
  journey: {
    ...publishedJourney,
    createdAt: '2020-11-19T12:34:56.647Z'
  }
}

export default JourneyDetailsStory as Meta
