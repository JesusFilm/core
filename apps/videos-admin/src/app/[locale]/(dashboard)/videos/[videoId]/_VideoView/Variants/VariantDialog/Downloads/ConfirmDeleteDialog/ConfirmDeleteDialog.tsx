import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations()

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="confirm-delete-dialog-title"
    >
      <DialogTitle id="confirm-delete-dialog-title">
        {t('Delete Download')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('Are you sure you want to delete this download?')}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {t('Cancel')}
        </Button>
        <Button onClick={handleConfirm} color="error" autoFocus>
          {t('Confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
