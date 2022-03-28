import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import { journeysAdminConfig } from '../../libs/storybook'
import { Dialog, DialogProps } from './Dialog'

const DialogStory = {
  ...journeysAdminConfig,
  component: Dialog,
  title: 'Journeys-Admin/Dialog'
}

const Template: Story = ({ ...args }: DialogProps) => {
  return <Dialog {...args} />
}

export const Basic = Template.bind({})
Basic.args = {
  open: true,
  handleClose: noop,
  title: 'Title',
  dialogAction: {
    onSubmit: noop,
    submitLabel: 'Accept',
    closeLabel: 'Cancel'
  },
  children: <Typography>This is the description</Typography>
}

export const ExcessContent = Template.bind({})
ExcessContent.args = {
  open: true,
  handleClose: noop,
  closeButton: true,
  divider: true,
  title: 'Submission Form with a really long title example',
  dialogAction: {
    onSubmit: noop
  },
  children: (
    <>
      <Typography>First Name:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Last Name:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Email:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Password:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Re-type password:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Security Question</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
      <Typography>Notes:</Typography>
      <TextField fullWidth sx={{ pb: 4 }} />
    </>
  )
}

export default DialogStory as Meta
