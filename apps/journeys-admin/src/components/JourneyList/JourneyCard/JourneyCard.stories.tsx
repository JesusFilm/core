import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney
} from '../journeyListData'
import { JourneyCard } from './JourneyCard'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyCard,
  title: 'Journeys-Admin/JourneyList/JourneyCard'
}

const Template: Story = ({ ...args }) => (
  <MockedProvider>
    <JourneyCard journey={defaultJourney} {...args} />
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = { journey: defaultJourney }

export const Published = Template.bind({})
Published.args = {
  journey: publishedJourney
}

export const ExcessContent = Template.bind({})
ExcessContent.args = {
  journey: descriptiveJourney
}
export const PreYear = Template.bind({})
PreYear.args = {
  journey: oldJourney
}

export default TestStory as Meta
