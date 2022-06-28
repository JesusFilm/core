import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import { useSnackbar } from 'notistack'
import { JourneyDelete } from '../../../../../../__generated__/JourneyDelete'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { Dialog } from '../../../../Dialog'

export const JOURNEY_DELETE = gql`
  mutation JourneyDelete($ids: [ID!]!) {
    journeysDelete(ids: $ids) {
      id
      status
    }
  }
`

interface DeleteJourneyProps {
  id: string
  handleClose: () => void
}

export function DeleteJourney({
  id,
  handleClose
}: DeleteJourneyProps): ReactElement {
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

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  function handleOpenDeleteDialog(): void {
    handleClose()
    setOpenDeleteDialog(true)
  }

  function handleCloseDeleteDialog(): void {
    setOpenDeleteDialog(false)
  }

  async function handleDelete(): Promise<void> {
    try {
      await deleteJourney()
      handleCloseDeleteDialog()
      enqueueSnackbar('Journey Deleted', {
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
    <>
      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={handleOpenDeleteDialog}
      >
        <ListItemIcon>
          <DeleteForeverRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Delete Forever
          </Typography>
        </ListItemText>
      </MenuItem>

      <Dialog
        open={openDeleteDialog}
        handleClose={handleCloseDeleteDialog}
        dialogTitle={{ title: 'Delete Forever?', closeButton: true }}
        dialogAction={{
          onSubmit: handleDelete,
          submitLabel: 'Delete',
          closeLabel: 'Cancel'
        }}
      >
        <Typography>
          Are you sure you would like to delete the journey immediately? You
          will not be able to undo this action.
        </Typography>
      </Dialog>
    </>
  )
}
