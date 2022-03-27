import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../libs/storybook'
import { Dialog } from './Dialog'

const DialogStory = {
  ...journeysAdminConfig,
  component: Dialog,
  title: 'Journeys-Admin/Dialog'
}

export const Default: Story = () => {
  return <Dialog />
}

export default DialogStory as Meta
