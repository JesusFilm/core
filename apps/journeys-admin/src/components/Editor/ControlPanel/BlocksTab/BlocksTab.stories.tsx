import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { BlocksTab } from '.'
import { MockedProvider } from '@apollo/client/testing'

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
  return (
    <MockedProvider>
      <BlocksTab />
    </MockedProvider>
  )
}

export default BlocksTabStory as Meta
