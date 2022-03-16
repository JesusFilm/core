import { ReactElement } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'

interface DeleteDialogProps {
  handleDelete: () => void
  open: boolean
  handleClose: () => void
}

export function DeleteDialog({
  handleDelete,
  open,
  handleClose
}: DeleteDialogProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-card-dialog"
      aria-describedby="delete-card-dialog"
    >
      <DialogTitle>Delete Card?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you would like to delete this card?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          color="secondary"
          onClick={handleClose}
          sx={{ fontWeight: 'normal' }}
        >
          Cancel
        </Button>
        <Button onClick={handleDelete} sx={{ fontWeight: 'normal', ml: 6 }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
