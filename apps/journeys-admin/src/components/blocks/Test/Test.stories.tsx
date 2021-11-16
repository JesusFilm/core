import { Story, Meta } from '@storybook/react'

import { journeyAdminConfig } from '../../../libs/storybook'
import TestComponent from './Test'

const TestStory = {
  ...journeyAdminConfig,
  component: TestComponent,
  title: 'JourneyAdmin/TestStory'
}

const Template: Story = () => <TestComponent />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
