import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { ReactElement } from 'react'

interface ConfirmDeleteDialogProps {
  open: boolean
  handleClose: () => void
  handleConfirm: () => void
}

export function ConfirmDeleteDialog({
  open,
  handleClose,
  handleConfirm
}: ConfirmDeleteDialogProps): ReactElement {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-delete-dialog-title"
    >
      <DialogTitle id="confirm-delete-dialog-title">
        Delete Download
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this download?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirm} color="error" autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  )
}
