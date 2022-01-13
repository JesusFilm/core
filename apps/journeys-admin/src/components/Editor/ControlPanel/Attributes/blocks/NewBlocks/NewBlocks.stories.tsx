import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../../libs/storybook'
import { NewBlocks } from '.'

const NewBlocksStory = {
  ...journeysAdminConfig,
  component: NewBlocks,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/NewBlock'
}

export const Default: Story = () => {
  return <NewBlocks />
}

export default NewBlocksStory as Meta
