import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import JourneyCardMenu from './JourneyCardMenu'

const TestStory = {
  ...journeysAdminConfig,
  component: JourneyCardMenu,
  title: 'Journeys-Admin/JourneyList/JourneyCard/JourneyCardMenu'
}

const Template: Story = () => <JourneyCardMenu />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
