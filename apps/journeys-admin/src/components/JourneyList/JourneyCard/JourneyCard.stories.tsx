import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import JourneyCard from './JourneyCard'
import {
  defaultJourney,
  descriptiveJourney,
  oldJourney,
  publishedJourney,
  noDescriptionJourney
} from '../journeyListData'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyCard,
  title: 'Journeys-Admin/JourneyList/JourneyCard'
}

const Template: Story = ({ ...args }) => (
  <JourneyCard journey={defaultJourney} {...args} />
)

export const Default = Template.bind({})
Default.args = { journey: defaultJourney }

export const PublishedJourney = Template.bind({})
PublishedJourney.args = {
  journey: publishedJourney
}
export const NoDescriptionJourney = Template.bind({})
NoDescriptionJourney.args = {
  journey: noDescriptionJourney
}

export const CardWithLongText = Template.bind({})
CardWithLongText.args = {
  journey: descriptiveJourney
}
export const OldJourney = Template.bind({})
OldJourney.args = {
  journey: oldJourney
}

export default TestStory as Meta
