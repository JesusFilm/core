import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { Tabs } from '.'

const TabsStory = {
  ...journeysAdminConfig,
  component: Tabs,
  title: 'Journeys-Admin/Editor/Tabs'
}

const Template: Story = () => <Tabs />

export const Default = Template.bind({})

export default TabsStory as Meta
