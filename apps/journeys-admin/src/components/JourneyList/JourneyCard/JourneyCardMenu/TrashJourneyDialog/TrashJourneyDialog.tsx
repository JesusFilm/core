import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyTrash } from '../../../../../../__generated__/JourneyTrash'

export const JOURNEY_TRASH = gql`
  mutation JourneyTrash($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`

export interface TrashJourneyDialogProps {
  id: string
  open: boolean
  handleClose: () => void
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function TrashJourneyDialog({
  id,
  open,
  handleClose,
  refetch
}: TrashJourneyDialogProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { enqueueSnackbar } = useSnackbar()

  const [trashJourney, { loading }] = useMutation<JourneyTrash>(JOURNEY_TRASH, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysTrash: [
        {
          id,
          status: JourneyStatus.deleted,
          __typename: 'Journey'
        }
      ]
    }
  })

  async function handleTrash(): Promise<void> {
    try {
      await trashJourney()
      handleClose()
      enqueueSnackbar(t('Journey trashed'), {
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
      dialogTitle={{ title: t('Trash Journey?'), closeButton: true }}
      loading={loading}
      dialogAction={{
        onSubmit: handleTrash,
        submitLabel: t('Delete'),
        closeLabel: t('Cancel')
      }}
      testId="TrashJourneyDialog"
    >
      <Typography>
        {t(
          'By selecting “delete”, this journey will be moved to the trash. It will ' +
            'remain there for 40 days, before being automatically and permanently ' +
            'deleted.'
        )}
      </Typography>
    </Dialog>
  )
}
