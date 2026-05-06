import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GET_INTEGRATION } from '../../../../libs/useIntegrationQuery'

export const INTEGRATION_DELETE = gql`
  mutation IntegrationDelete($id: ID!) {
    integrationDelete(id: $id) {
      id
    }
  }
`

export interface GoogleIntegrationRemoveDialogProps {
  open: boolean
  integrationId?: string
  teamId?: string
  handleClose: () => void
}

export function GoogleIntegrationRemoveDialog({
  open,
  integrationId,
  teamId,
  handleClose
}: GoogleIntegrationRemoveDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()
  const router = useRouter()

  const [integrationDelete, { loading }] = useMutation(INTEGRATION_DELETE)

  async function handleConfirm(): Promise<void> {
    if (integrationId == null || teamId == null) return

    try {
      const { data } = await integrationDelete({
        variables: { id: integrationId },
        refetchQueries: [
          {
            query: GET_INTEGRATION,
            variables: { teamId }
          }
        ],
        awaitRefetchQueries: true
      })

      if (data?.integrationDelete?.id != null) {
        await router.push(`/teams/${teamId}/integrations`)
        enqueueSnackbar(t('Google integration deleted'), {
          variant: 'success',
          preventDuplicate: true
        })
      } else {
        enqueueSnackbar(
          t('Google settings failed. Reload the page or try again.'),
          {
            variant: 'error',
            preventDuplicate: true
          }
        )
      }
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    } finally {
      handleClose()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{
        title: t('Remove Google Integration'),
        closeButton: true
      }}
      dialogActionChildren={
        <Stack direction="row" gap={2}>
          <Button onClick={handleClose} disabled={loading}>
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirm}
            loading={loading}
          >
            {t('Remove Integration')}
          </Button>
        </Stack>
      }
    >
      <Stack gap={2}>
        <Typography variant="body1">
          {t(
            'Removing this Google integration will mark all active Google Sheets syncs as removed and unlink them from this account. This cannot be undone.'
          )}
        </Typography>
      </Stack>
    </Dialog>
  )
}
