import { Dialog } from '@core/shared/ui/Dialog'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

interface DeleteDialog {
  openDialog: boolean
  handleCloseDialog: () => void
  handleDeleteBlock: () => Promise<void>
  loading: boolean
}

export function DeleteDialog({
  openDialog,
  handleCloseDialog,
  handleDeleteBlock,
  loading
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      dialogTitle={{ title: t('Delete Card?') }}
      dialogAction={{
        onSubmit: handleDeleteBlock,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      loading={loading}
    >
      <Typography>
        {t('Are you sure you would like to delete this card?')}
      </Typography>
    </Dialog>
  )
}
