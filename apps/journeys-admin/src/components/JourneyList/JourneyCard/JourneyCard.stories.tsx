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
  <JourneyCard journey={defaultJourney} {...args} />
)

const Default = Template.bind({})
Default.args = { journey: defaultJourney }

const Published = Template.bind({})
Published.args = {
  journey: publishedJourney
}

const ExcessContent = Template.bind({})
ExcessContent.args = {
  journey: descriptiveJourney
}
const PreYear = Template.bind({})
PreYear.args = {
  journey: oldJourney
}

export default TestStory as Meta
export { Default, Published, ExcessContent, PreYear }
