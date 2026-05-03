import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export interface CollectionUngroupDialogProps {
  open: boolean
  wasPublished: boolean
  slug: string
  publicUrl: string | null
  onClose: () => void
  onConfirm: () => void
}

export function CollectionUngroupDialog({
  open,
  wasPublished,
  publicUrl,
  onClose,
  onConfirm
}: CollectionUngroupDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  return (
    <Dialog
      open={open}
      onClose={onClose}
      dialogTitle={{ title: t('Ungroup this collection?'), closeButton: true }}
      dialogAction={{
        onSubmit: onConfirm,
        submitLabel: t('Ungroup'),
        closeLabel: t('Cancel')
      }}
      testId="CollectionUngroupDialog"
    >
      <Stack spacing={2}>
        <Typography>
          {t(
            'Ungrouping dissolves this collection. Templates inside return to the flat list.'
          )}
        </Typography>
        {wasPublished && (
          <Typography color="text.secondary">
            {publicUrl != null
              ? t('The public URL {{ publicUrl }} will return 404.', {
                  publicUrl
                })
              : t('Any public URL for this collection will return 404.')}
          </Typography>
        )}
      </Stack>
    </Dialog>
  )
}
