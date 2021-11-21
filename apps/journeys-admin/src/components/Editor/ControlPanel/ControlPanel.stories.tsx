import { Story, Meta } from '@storybook/react'
import { journeyAdminConfig } from '../../../libs/storybook'
import { ControlPanel } from '.'

const ControlPanelStory = {
  ...journeyAdminConfig,
  component: ControlPanel,
  title: 'Journeys-Admin/Editor/ControlPanel'
}

const Template: Story = () => <ControlPanel />

export const Default = Template.bind({})

export default ControlPanelStory as Meta
