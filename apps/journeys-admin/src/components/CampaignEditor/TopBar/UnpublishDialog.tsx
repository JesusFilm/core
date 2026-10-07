import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface UnpublishDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

/**
 * The one confirmation the top bar has. Unpublish takes the landing page and
 * every region page offline at once while distributed share links still
 * point there, so the dialog states what stays up.
 */
export function UnpublishDialog({
  open,
  onClose,
  onConfirm
}: UnpublishDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Unpublish campaign?'), closeButton: true }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Unpublish'),
        closeLabel: t('Cancel')
      }}
      testId="CampaignUnpublishDialog"
    >
      <Typography>
        {t(
          'The landing page and every region page go offline. The linked journeys and their QR codes keep working at their own URLs.'
        )}
      </Typography>
    </Dialog>
  )
}
