import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../../../../libs/storybook'
import JourneyCardMenu from './JourneyCardMenu'

const TestStory = {
  ...journeyAdminConfig,
  component: JourneyCardMenu,
  title: 'Journey-Admin/JourneyCardMenu'
}

const Template: Story = () => <JourneyCardMenu />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
