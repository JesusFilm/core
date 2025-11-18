import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DocumentNode } from 'graphql'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

export const DELETE_GOOGLE_SHEETS_SYNC = gql`
  mutation GoogleIntegrationDetailsSyncDelete($id: ID!) {
    googleSheetsSyncDelete(id: $id) {
      id
    }
  }
`

export interface GoogleIntegrationDeleteSyncDialogProps {
  open: boolean
  syncId: string | null
  integrationId?: string
  syncsQueryDocument: DocumentNode
  handleClose: () => void
}

export function GoogleIntegrationDeleteSyncDialog({
  open,
  syncId,
  integrationId,
  syncsQueryDocument,
  handleClose
}: GoogleIntegrationDeleteSyncDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [deleteSync, { loading: isProcessing }] = useMutation(
    DELETE_GOOGLE_SHEETS_SYNC
  )

  async function handleConfirm(): Promise<void> {
    if (syncId == null || integrationId == null || isProcessing) return

    try {
      await deleteSync({
        variables: { id: syncId },
        refetchQueries: [
          {
            query: syncsQueryDocument,
            variables: { filter: { integrationId } }
          }
        ],
        awaitRefetchQueries: true
      })
      enqueueSnackbar(t('Sync removed'), { variant: 'success' })
      handleClose()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, { variant: 'error' })
      }
    }
  }

  function handleDialogClose(): void {
    if (isProcessing) return
    handleClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      dialogTitle={{
        title: t('Delete Google Sheets Sync'),
        closeButton: true
      }}
      divider={false}
      maxWidth="sm"
      dialogActionChildren={
        <Stack direction="row" gap={2}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDialogClose}
            disabled={isProcessing}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            loading={isProcessing}
          >
            {t('Delete Sync')}
          </Button>
        </Stack>
      }
    >
      <Stack gap={2}>
        <Typography variant="body1">
          {t(
            "Data will no longer update in the associated Google Sheet if you delete this sync. Existing data will remain, but new updates won't be sent."
          )}
        </Typography>
        <Typography variant="body1">
          {t('You will have to start a new sync to re-start syncing.')}
        </Typography>
      </Stack>
    </Dialog>
  )
}
