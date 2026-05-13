import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export interface CollectionUngroupDialogProps {
  open: boolean
  wasPublished: boolean
  onClose: () => void
  onConfirm: () => void
}

export function CollectionUngroupDialog({
  open,
  wasPublished,
  onClose,
  onConfirm
}: CollectionUngroupDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{
        title: t('Remove this collection?'),
        closeButton: true
      }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Remove'),
        closeLabel: t('Cancel')
      }}
      testId="CollectionUngroupDialog"
    >
      <Stack spacing={2}>
        <Typography>
          {t(
            'Removing this collection returns its templates to the flat list.'
          )}
        </Typography>
        {wasPublished && (
          <Typography color="text.secondary">
            {t('Any public URL for this collection will return 404.')}
          </Typography>
        )}
      </Stack>
    </Dialog>
  )
}
