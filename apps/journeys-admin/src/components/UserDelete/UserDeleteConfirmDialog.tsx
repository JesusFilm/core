import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface UserDeleteConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function UserDeleteConfirmDialog({
  open,
  onClose,
  onConfirm
}: UserDeleteConfirmDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-delete-title"
    >
      <DialogTitle id="confirm-delete-title">
        {t('Confirm User Deletion')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t(
            'Are you sure you want to permanently delete this user? This action cannot be undone. All associated data including journeys, team memberships, and related records will be permanently removed.'
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>
          {t('Cancel')}
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {t('Delete Permanently')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
