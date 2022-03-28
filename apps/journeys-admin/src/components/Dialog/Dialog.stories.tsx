import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { journeysAdminConfig } from '../../libs/storybook'
import { Dialog } from './Dialog'

const DialogStory = {
  ...journeysAdminConfig,
  component: Dialog,
  title: 'Journeys-Admin/Dialog'
}

export const Default: Story = () => {
  const props = {
    open: true,
    handleClose: noop,
    title: 'Title',
    description: 'Would you like to confirm this action?',
    dialogAction: {
      onSubmit: noop,
      submitText: 'Accept'
    }
  }
  return <Dialog {...props} />
}

export default DialogStory as Meta
