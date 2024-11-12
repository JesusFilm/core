import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyDelete } from '../../../../../../__generated__/JourneyDelete'

export const JOURNEY_DELETE = gql`
  mutation JourneyDelete($ids: [ID!]!) {
    journeysDelete(ids: $ids) {
      id
      status
    }
  }
`

export interface DeleteJourneyDialogProps {
  id: string
  open: boolean
  handleClose: () => void
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function DeleteJourneyDialog({
  id,
  open,
  handleClose,
  refetch
}: DeleteJourneyDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  const [deleteJourney, { loading }] = useMutation<JourneyDelete>(
    JOURNEY_DELETE,
    {
      variables: {
        ids: [id]
      },
      optimisticResponse: {
        journeysDelete: [
          {
            id,
            status: JourneyStatus.deleted,
            __typename: 'Journey'
          }
        ]
      }
    }
  )

  async function handleDelete(): Promise<void> {
    try {
      await deleteJourney()
      handleClose()
      enqueueSnackbar(t('Journey Deleted'), {
        variant: 'success',
        preventDuplicate: true
      })
      await refetch?.()
    } catch (error) {
      if (error instanceof Error) {
        enqueueSnackbar(error.message, {
          variant: 'error',
          preventDuplicate: true
        })
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dialogTitle={{ title: t('Delete Forever?'), closeButton: true }}
      loading={loading}
      dialogAction={{
        onSubmit: handleDelete,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="DeleteJourneyDialog"
    >
      <Typography>
        {t(
          'Are you sure you would like to delete the journey immediately? You will ' +
            'not be able to undo or restore these journeys.'
        )}
      </Typography>
    </Dialog>
  )
}
