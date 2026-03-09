import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

interface DeleteSyncDialogProps {
  syncIdPendingDelete: string | null
  deletingSyncId: string | null
  onClose: () => void
  onDelete: (syncId: string) => void
}

export function DeleteSyncDialog({
  syncIdPendingDelete,
  deletingSyncId,
  onClose,
  onDelete
}: DeleteSyncDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={syncIdPendingDelete != null}
      onClose={() => {
        if (deletingSyncId != null) return
        onClose()
      }}
      dialogTitle={{
        title: t('Delete Google Sheets Sync'),
        closeButton: true
      }}
      divider={false}
      maxWidth="sm"
      dialogActionChildren={
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            disabled={deletingSyncId != null}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (syncIdPendingDelete != null) {
                onDelete(syncIdPendingDelete)
              }
            }}
            loading={deletingSyncId != null}
          >
            {t('Delete Sync')}
          </Button>
        </Box>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body1">
          {t(
            "Data will no longer update in your Google Sheet if you delete this sync. Existing data will remain, but new updates won't be sent."
          )}
        </Typography>
        <Typography variant="body1">
          {t('You will have to start a new sync to re-start syncing.')}
        </Typography>
      </Box>
    </Dialog>
  )
}
