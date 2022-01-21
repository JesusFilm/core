import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { BlocksTab } from '.'

const BlocksTabStory = {
  ...journeysAdminConfig,
  component: BlocksTab,
  title: 'Journeys-Admin/Editor/ControlPanel/BlocksTab',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

export const Default: Story = () => {
  return <BlocksTab />
}

export default BlocksTabStory as Meta
