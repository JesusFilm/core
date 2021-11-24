import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../libs/storybook'
import JourneyList from './JourneyList'
import { defaultJourney } from './journeyListData'

const TestStory = {
  ...journeyAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList'
}

const Template: Story = () => <JourneyList journeys={[defaultJourney]} />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
