import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../../../libs/storybook'
import JourneyCard from './JourneyCard'
import { defaultJourney } from '../journeyListData'

const TestStory = {
  ...journeyAdminConfig,
  component: JourneyCard,
  title: 'Journey-Admin/JourneyCard'
}

const Template: Story = () => <JourneyCard journey={defaultJourney} />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
