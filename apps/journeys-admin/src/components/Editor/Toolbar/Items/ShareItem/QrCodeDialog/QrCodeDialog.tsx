import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface QrCodeDialogProps {
  open: boolean
  onClose: () => void
  initialJourneyUrl?: string
}

export function QrCodeDialog({
  open,
  onClose,
  initialJourneyUrl
}: QrCodeDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose()
      }}
      dialogTitle={{
        title: t('QR Code'),
        closeButton: true
      }}
    />
  )
}
