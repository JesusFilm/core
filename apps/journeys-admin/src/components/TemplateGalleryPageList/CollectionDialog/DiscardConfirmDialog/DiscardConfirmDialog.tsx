import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export interface DiscardConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DiscardConfirmDialog({
  open,
  onCancel,
  onConfirm
}: DiscardConfirmDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      dialogTitle={{ title: t('You have unsaved changes — discard?') }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Discard'),
        closeLabel: t('Cancel')
      }}
      testId="CollectionDiscardConfirmDialog"
    >
      <Typography>
        {t('Your edits to this collection will be lost.')}
      </Typography>
    </Dialog>
  )
}
