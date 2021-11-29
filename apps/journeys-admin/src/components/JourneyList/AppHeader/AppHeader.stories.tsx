import { journeysAdminConfig } from '../../../libs/storybook'
import { Meta, Story } from '@storybook/react'
import AppHeader from './AppHeader'

const AppHeaderDemo = {
    ...journeysAdminConfig,
    component: AppHeader,
    title: 'Journeys-Admin/JourneyList/AppHeader'
}

const Template: Story = () => AppHeader()

export const StoryComponent = Template.bind({})


export default AppHeaderDemo as Meta