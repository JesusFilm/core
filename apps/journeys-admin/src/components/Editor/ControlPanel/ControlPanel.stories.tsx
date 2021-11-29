import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../libs/storybook'
import { ControlPanel } from '.'

const ControlPanelStory = {
  ...journeysAdminConfig,
  component: ControlPanel,
  title: 'Journeys-Admin/Editor/ControlPanel'
}

const Template: Story = () => <ControlPanel />

export const Default = Template.bind({})

export default ControlPanelStory as Meta
