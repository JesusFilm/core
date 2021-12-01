import { Story, Meta } from '@storybook/react'

import { journeysAdminConfig } from '../../../libs/storybook'
import CardOverview from './CardOverview'

const TestStory = {
  ...journeysAdminConfig,
  component: CardOverview,
  title: 'Journeys-Admin//SingleJourney/CardOverview'
}

const Template: Story = () => <CardOverview />

export const StoryComponent = Template.bind({})

export default TestStory as Meta
