import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { UnpublishedVideoBanner } from '../UnpublishedVideoBanner'

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
      <UnpublishedVideoBanner />
    </Dialog>
  )
}

export default UnpublishedVideoDialog
