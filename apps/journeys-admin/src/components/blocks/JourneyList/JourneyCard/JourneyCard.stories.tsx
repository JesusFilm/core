import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../../../libs/storybook'
import JourneyCard from './JourneyCard'
import { defaultJourney, descriptiveJourney } from '../journeyListData'

const TestStory = {
  ...journeyAdminConfig,
  component: JourneyCard,
  title: 'Journey-Admin/JourneyList/JourneyCard'
}

const Template: Story = (args) => (
  <JourneyCard journey={defaultJourney} {...args} />
)

export const Default = Template.bind({})
Default.args = { journey: defaultJourney }

export const CardWithLongText = Template.bind({})
CardWithLongText.args = { journey: descriptiveJourney }

export default TestStory as Meta
