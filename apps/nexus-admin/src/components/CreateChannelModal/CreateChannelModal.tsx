import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from '@mui/material'
import { FC } from 'react'
import { Modal } from '../Modal'

interface CreateChannelModalProps {
  open: boolean
  onClose: () => void
}

export const CreateChannelModal: FC<CreateChannelModalProps> = ({
  open,
  onClose
}) => {
  return (
    <Modal
      title="Create New Channel"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button>Create Channel</Button>
        </Stack>
      }
    >
      <Stack spacing={4}>
        <TextField label="Channel Name" variant="filled" />
        <TextField label="Channel Description" variant="filled" />
        <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
          <InputLabel>Platform Type</InputLabel>
          <Select value={'youtube'} onChange={() => {}}>
            <MenuItem value={'youtube'}>Youtube</MenuItem>
          </Select>
        </FormControl>
      </Stack>
    </Modal>
  )
}
