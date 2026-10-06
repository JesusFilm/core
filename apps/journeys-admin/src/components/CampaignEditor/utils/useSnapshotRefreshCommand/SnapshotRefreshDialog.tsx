import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface SnapshotRefreshDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * The one confirmation "Refresh from journey" has, shown only when the card's
 * title or description no longer matches the journey's: it replaces both, and
 * the copy points at undo.
 */
export function SnapshotRefreshDialog({
  open,
  onClose,
  onConfirm
}: SnapshotRefreshDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Replace this card’s text?'), closeButton: true }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Refresh'),
        closeLabel: t('Cancel')
      }}
      testId="CampaignSnapshotRefreshDialog"
    >
      <Typography gutterBottom>
        {t(
          'The title or description differs from the journey’s. Refreshing replaces both with what the journey says now; your translations are kept.'
        )}
      </Typography>
      <Typography>{t('You can undo this afterwards.')}</Typography>
    </Dialog>
  )
}
