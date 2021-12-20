import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import { JourneyCard } from './JourneyCard'
import { defaultJourney } from '../journeyListData'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyCard,
  title: 'Journeys-Admin/JourneyList/JourneyCard'
}

const Template: Story = () => <JourneyCard journey={defaultJourney} />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
