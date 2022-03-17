import { ReactElement } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

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
      <DialogTitle>
        <Typography variant="subtitle1" sx={{ textTransform: 'none' }}>
          Delete Card?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1" color="secondary.dark">
            Are you sure you would like to delete this card?
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{ fontWeight: 'normal', color: 'secondary.light' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          sx={{ fontWeight: 'normal', ml: 6, color: 'primary.light' }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
