import { journeysAdminConfig } from '../../../libs/storybook'
import { Meta, Story } from '@storybook/react'
import JourneysAppHeader from './JourneysAppHeader'

const JourneysAppHeaderDemo = {
  ...journeysAdminConfig,
  component: JourneysAppHeader,
  title: 'Journeys-Admin/JourneyList/AppHeader'
}

const Template: Story = () => JourneysAppHeader()

export const Default = Template.bind({})

export default JourneysAppHeaderDemo as Meta
