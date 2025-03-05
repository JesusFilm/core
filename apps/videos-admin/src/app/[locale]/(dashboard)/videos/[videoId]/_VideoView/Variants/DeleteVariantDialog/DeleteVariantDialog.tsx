import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { useTranslations } from 'next-intl'
import { ReactElement } from 'react'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'

interface DeleteVariantDialogProps {
  variant: GetAdminVideoVariant | null
  open: boolean
  loading: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
}

export function DeleteVariantDialog({
  variant,
  open,
  loading,
  onClose,
  onConfirm
}: DeleteVariantDialogProps): ReactElement {
  const t = useTranslations()

  const languageName =
    variant?.language.name.find(({ primary }) => primary)?.value ??
    variant?.language.name.find(({ primary }) => !primary)?.value

  const handleConfirm = async (): Promise<void> => {
    await onConfirm()
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="delete-variant-dialog-title"
    >
      <DialogTitle id="delete-variant-dialog-title">
        {t('Delete Audio Language')}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {t('deleteVariantDialog', {
            language: languageName
          })}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading} color="inherit">
          {t('Cancel')}
        </Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? t('Deleting...') : t('Delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
