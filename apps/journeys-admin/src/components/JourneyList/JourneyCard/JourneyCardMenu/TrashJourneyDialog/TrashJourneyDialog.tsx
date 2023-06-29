import { ReactElement } from 'react'
import { useMutation, gql, ApolloQueryResult } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { Dialog } from '@core/shared/ui/Dialog'
import { useSnackbar } from 'notistack'
import { JourneyTrash } from '../../../../../../__generated__/JourneyTrash'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { GetAdminJourneys } from '../../../../../../__generated__/GetAdminJourneys'

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
  const [trashJourney] = useMutation<JourneyTrash>(JOURNEY_TRASH, {
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

  const { enqueueSnackbar } = useSnackbar()

  async function handleTrash(): Promise<void> {
    try {
      await trashJourney()
      enqueueSnackbar('Journey trashed', {
        variant: 'success',
        preventDuplicate: true
      })
      await refetch?.()
      handleClose()
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
      onClose={handleClose}
      dialogTitle={{ title: 'Trash Journey?', closeButton: true }}
      dialogAction={{
        onSubmit: handleTrash,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
    >
      <Typography>
        By selecting “delete”, this journey will be moved to the trash. It will
        remain there for 40 days, before being automatically and permanently
        deleted.
      </Typography>
    </Dialog>
  )
}
