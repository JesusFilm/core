import { Button, Stack, Typography } from '@mui/material'
import { FC } from 'react'

import { Modal } from '../Modal'

interface DeleteModalProps {
  content: string
  open: boolean
  onClose: () => void
  onDelete: () => void
}

export const DeleteModal: FC<DeleteModalProps> = ({
  content,
  open,
  onClose,
  onDelete
}) => {
  return (
    <Modal
      title="Delete"
      open={open}
      handleClose={onClose}
      actions={
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onDelete}>Delete</Button>
        </Stack>
      }
    >
      <Typography>{content}</Typography>
    </Modal>
  )
}
