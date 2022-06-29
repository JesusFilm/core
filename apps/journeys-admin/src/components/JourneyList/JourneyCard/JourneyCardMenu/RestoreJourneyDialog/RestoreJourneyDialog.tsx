import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import Typography from '@mui/material/Typography'
import { JourneyRestore } from '../../../../../../__generated__/JourneyRestore'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { Dialog } from '../../../../Dialog'

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
}

export function RestoreJourneyDialog({
  id,
  published,
  open,
  handleClose
}: RestoreJourneyDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

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
      enqueueSnackbar('Journey Restored', {
        variant: 'success',
        preventDuplicate: true
      })
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <Dialog
      open={open}
      handleClose={handleClose}
      dialogTitle={{ title: 'Restore Journey?', closeButton: true }}
      dialogAction={{
        onSubmit: handleRestore,
        submitLabel: 'Restore',
        closeLabel: 'Cancel'
      }}
    >
      <Typography>
        Are you sure you would like to restore this journeys
      </Typography>
    </Dialog>
  )
}
