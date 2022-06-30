import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { JourneyTrash } from '../../../../../../__generated__/JourneyTrash'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { Dialog } from '../../../../Dialog'

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
}

export function TrashJourneyDialog({
  id,
  open,
  handleClose
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
      enqueueSnackbar('Moved To Trash', {
        variant: 'success',
        preventDuplicate: true
      })
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
      handleClose={handleClose}
      dialogTitle={{ title: 'Delete Journey?', closeButton: true }}
      dialogAction={{
        onSubmit: handleTrash,
        submitLabel: 'Delete',
        closeLabel: 'Cancel'
      }}
    >
      <Typography>
        Journey will be moved to trash. You can find this journey under the
        Trash tab for 40 days, until it is premanently deleted.
      </Typography>
    </Dialog>
  )
}
