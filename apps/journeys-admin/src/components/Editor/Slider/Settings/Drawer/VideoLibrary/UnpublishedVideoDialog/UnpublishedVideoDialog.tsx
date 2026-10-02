import Alert from '@mui/material/Alert'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export interface UnpublishedVideoDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

// Blocks a video selection from completing silently: shown whenever the user
// selects (Select or Apply) a video whose variant is unpublished, so the
// warning is un-missable rather than a banner they could scroll past.
export function UnpublishedVideoDialog({
  open,
  onClose,
  onConfirm
}: UnpublishedVideoDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Unpublished Video') }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Use Anyway'),
        closeLabel: t('Cancel')
      }}
      testId="UnpublishedVideoDialog"
    >
      <Alert severity="warning">
        {t(
          'This video has not been published yet. It can still be added to a journey, but visitors will not be able to watch it until it is published.'
        )}
      </Alert>
    </Dialog>
  )
}

export default UnpublishedVideoDialog
