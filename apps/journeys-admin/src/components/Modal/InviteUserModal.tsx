import { ReactElement, useState } from 'react'
import {
  Button,
  Modal,
  Box,
  Avatar,
  Typography,
  Divider,
  FilledInput,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material'
import { ContentCopyRounded, LinkRounded } from '@mui/icons-material'

const fakeUsers = [
  {
    id: 'firebaseId1',
    firstName: 'John',
    lastName: 'Geronimo',
    email: 'john@gmail.com',
    imageUrl:
      'https://lh3.googleusercontent.com/a/AATXAJxOLQjNEXpqvNUiM31hrlLbvneWbUAvB3OG-StX=s96-c',
    userJourneys: {
      role: 'Owner',
      userId: 'userId1',
      journeyId: 'journeyId1'
    }
  },
  {
    id: 'firebaseId2',
    firstName: 'Josh',
    lastName: 'Thomas',
    email: 'Josh@Thomas.com',
    imageUrl: '',
    userJourneys: {
      role: 'Editor',
      userId: 'userId2',
      journeyId: 'journeyId3'
    }
  }
]

export const InviteUserModal = (): ReactElement => {
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  return (
    <Box>
      <Button variant="contained" onClick={handleOpen}>Invite</Button>
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            p: 4
          }}
        >
          <Typography variant={'subtitle1'}>Invite Other Editors</Typography>
          <FormControl fullWidth>
            <FilledInput
              placeholder="this is where the invite link goes"
              startAdornment={<LinkRounded />}
              endAdornment={<ContentCopyRounded />}
              disableUnderline
            />
          </FormControl>
          <Typography variant={'caption'}>Anyone with this link can see journey and ask for editing rights. You can accept or reject every request</Typography>
          <Divider />
          {/* write logic here to check if any editors are invited */}
          <Typography variant={'body1'}>Requested Editing Rights</Typography>
          {fakeUsers.map((user) => (
            <Box key={user.id} display="flex" alignItems="center">
              <Avatar src={user.imageUrl} />
              <Box ml={2}>
                <Typography variant={'body2'}>{`${user.firstName} ${user.lastName}`}</Typography>
                <Typography variant={'caption'}>{user.email}</Typography>
              </Box>
              {/* I need a button the shows up a modal or a dropdown */}
              <FormControl fullWidth>
                <InputLabel>Manage</InputLabel>
                <Select variant='standard' disableUnderline>
                  <MenuItem>Approve</MenuItem>
                  <Divider />
                  <MenuItem>Remove</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
          <Divider />
          <Typography variant={'body1'}>Users With Access</Typography>
          {fakeUsers.map((user) => (
            <Box key={user.id} display="flex" alignItems="center">
              <Avatar src={user.imageUrl} />
              <Box ml={2}>
                <Typography variant={'body2'}>{`${user.firstName} ${user.lastName}`}</Typography>
                <Typography variant={'caption'}>{user.email}</Typography>
              </Box>
              <FormControl fullWidth>
                <InputLabel>{user.userJourneys.role}</InputLabel>
                <Select variant='standard' disableUnderline>
                  <MenuItem>Approve</MenuItem>
                  <Divider />
                  <MenuItem>Remove</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
      </Modal>
    </Box>
  )
}
