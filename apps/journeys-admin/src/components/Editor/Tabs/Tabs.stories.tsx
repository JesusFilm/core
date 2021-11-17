import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../libs/storybook'
import { Tabs } from '.'

const TabsStory = {
  ...journeyAdminConfig,
  component: Tabs,
  title: 'JourneyAdmin/Editor/Tabs'
}

const Template: Story = () => <Tabs />

export const Default = Template.bind({})

export default TabsStory as Meta
