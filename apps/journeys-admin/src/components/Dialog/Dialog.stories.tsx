import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MuiListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import Skeleton from '@mui/material/Skeleton'
import ListItemText from '@mui/material/ListItemText'
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
  title: 'Simple Dialog',
  dialogAction: {
    onSubmit: noop,
    submitLabel: 'Ok'
  },
  children: <Typography>This is the content</Typography>
}

export const Form = Template.bind({})
Form.args = {
  open: true,
  handleClose: noop,
  title: 'Edit Form',
  closeButton: true,
  dialogAction: {
    onSubmit: noop,
    closeLabel: 'Cancel'
  },
  children: <TextField fullWidth label="Field Label" value="name" />
}

export const Info = Template.bind({})
Info.args = {
  open: true,
  handleClose: noop,
  title: 'Info Dialog',
  closeButton: true,
  divider: true,
  children: (
    <>
      <Typography>This is the content for the information</Typography>
      {[0, 1, 2].map((i) => (
        <MuiListItem sx={{ px: 0 }} key={i}>
          <ListItemAvatar>
            <Skeleton
              animation={false}
              variant="circular"
              width={40}
              height={40}
            />
          </ListItemAvatar>
          <ListItemText
            primary={<Skeleton animation={false} variant="text" width="60%" />}
            secondary={
              <Skeleton animation={false} variant="text" width="30%" />
            }
          />
        </MuiListItem>
      ))}
    </>
  )
}

export default DialogStory as Meta
