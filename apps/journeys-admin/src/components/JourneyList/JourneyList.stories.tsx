import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../libs/storybook'
import { JourneyList } from './JourneyList'
import { defaultJourney } from './journeyListData'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyList,
  title: 'Journeys-Admin/JourneyList'
}

const Template: Story = () => <JourneyList journeys={[defaultJourney]} />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
