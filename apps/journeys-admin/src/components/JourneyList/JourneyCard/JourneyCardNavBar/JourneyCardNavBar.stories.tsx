import { journeysAdminConfig } from '../../../../libs/storybook'
import { Meta, Story } from '@storybook/react'
import JourneyCardNavBar from './JourneyCardNavBar'

const AppHeaderDemo = {
  ...journeysAdminConfig,
  component: JourneyCardNavBar,
  title: 'Journeys-Admin/JourneyList/JourneyCard/JourneyCardNavBar'
}

const Template: Story = () => JourneyCardNavBar()

export const StoryComponent = Template.bind({})

export default AppHeaderDemo as Meta
