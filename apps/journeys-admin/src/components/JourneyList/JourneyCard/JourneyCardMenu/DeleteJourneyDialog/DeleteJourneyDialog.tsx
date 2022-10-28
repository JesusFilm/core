import { ReactElement } from 'react'
import { useMutation, gql, ApolloQueryResult } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useSnackbar } from 'notistack'
import { JourneyDelete } from '../../../../../../__generated__/JourneyDelete'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { GetActiveJourneys } from '../../../../../../__generated__/GetActiveJourneys'
import { GetArchivedJourneys } from '../../../../../../__generated__/GetArchivedJourneys'
import { GetTrashedJourneys } from '../../../../../../__generated__/GetTrashedJourneys'

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
  refetch?: () => Promise<
    ApolloQueryResult<
      GetActiveJourneys | GetArchivedJourneys | GetTrashedJourneys
    >
  >
}

export function DeleteJourneyDialog({
  id,
  open,
  handleClose,
  refetch
}: DeleteJourneyDialogProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const [deleteJourney] = useMutation<JourneyDelete>(JOURNEY_DELETE, {
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
  })

  async function handleDelete(): Promise<void> {
    try {
      await deleteJourney()
      handleClose()
      enqueueSnackbar('Journey Deleted', {
        variant: 'success',
        preventDuplicate: true
      })
      await refetch?.()
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
      dialogTitle={{ title: 'Delete Forever?', closeButton: true }}
      dialogAction={{
        onSubmit: handleDelete,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
    >
      <Typography>
        Are you sure you would like to delete the journey immediately? You will
        not be able to undo or restore these journeys.
      </Typography>
    </Dialog>
  )
}
