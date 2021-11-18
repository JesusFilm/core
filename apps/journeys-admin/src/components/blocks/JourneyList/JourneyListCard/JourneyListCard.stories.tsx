import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../../../libs/storybook'
import JourneyListCard from './JourneyListCard'
import { defaultJourney } from '../journeyListData'

const TestStory = {
  ...journeyAdminConfig,
  component: JourneyListCard,
  title: 'JourneyAdmin/JourneyListCard'
}

const Template: Story = () => <JourneyListCard journey={defaultJourney} />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
