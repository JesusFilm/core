import { ApolloQueryResult, gql, useMutation } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement } from 'react'

import { Dialog } from '@core/shared/ui/Dialog'

import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyRestore } from '../../../../../../__generated__/JourneyRestore'

export const JOURNEY_RESTORE = gql`
  mutation JourneyRestore($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

export interface RestoreJourneyDialogProps {
  id: string
  published: boolean
  open: boolean
  handleClose: () => void
  refetch?: () => Promise<ApolloQueryResult<GetAdminJourneys>>
}

export function RestoreJourneyDialog({
  id,
  published,
  open,
  handleClose,
  refetch
}: RestoreJourneyDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()
  const { t } = useTranslation('apps-journeys-admin')

  const previousStatus = published
    ? JourneyStatus.published
    : JourneyStatus.draft

  const [restoreJourney] = useMutation<JourneyRestore>(JOURNEY_RESTORE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysRestore: [
        {
          id,
          status: previousStatus,
          __typename: 'Journey'
        }
      ]
    }
  })

  async function handleRestore(): Promise<void> {
    try {
      await restoreJourney()
      handleClose()
      enqueueSnackbar(t('Journey Restored'), {
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
      dialogTitle={{ title: t('Restore Journey?'), closeButton: true }}
      dialogAction={{
        onSubmit: handleRestore,
        submitLabel: t('Restore'),
        closeLabel: t('Cancel')
      }}
      testId="RestoreJourneyDialog"
    >
      <Typography>
        {t('Are you sure you would like to restore this journey?')}
      </Typography>
    </Dialog>
  )
}
