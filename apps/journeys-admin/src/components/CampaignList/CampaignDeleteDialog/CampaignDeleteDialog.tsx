import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface CampaignDeleteDialogProps {
  open: boolean
  title: string
  wasPublished: boolean
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CampaignDeleteDialog({
  open,
  title,
  wasPublished,
  loading = false,
  onClose,
  onConfirm
}: CampaignDeleteDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      loading={loading}
      dialogTitle={{ title: t('Delete {{title}}?', { title }) }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="CampaignDeleteDialog"
    >
      <Typography>
        {wasPublished
          ? t(
              'The public campaign page will stop working immediately and any shared links to it will break. The journeys themselves are not deleted.'
            )
          : t(
              'This draft campaign will be permanently deleted. The journeys themselves are not deleted.'
            )}
      </Typography>
    </Dialog>
  )
}
