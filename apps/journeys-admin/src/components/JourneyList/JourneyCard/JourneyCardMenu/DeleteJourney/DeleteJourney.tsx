import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { useSnackbar } from 'notistack'
import { JourneyDelete } from '../../../../../../__generated__/JourneyDelete'
import { JourneyRestore } from '../../../../../../__generated__/JourneyRestore'
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

export const JOURNEY_RESTORE = gql`
  mutation JourneyRestore($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

interface DeleteJourneyProps {
  id: string
  published: boolean
  handleClose: () => void
}

export function DeleteJourney({
  id,
  published,
  handleClose
}: DeleteJourneyProps): ReactElement {
  const { enqueueSnackbar } = useSnackbar()

  const previousStatus = published
    ? JourneyStatus.published
    : JourneyStatus.draft

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

  const [openRestoreDialog, setOpenRestoreDialog] = useState(false)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  function handleOpenDeleteDialog(): void {
    setOpenRestoreDialog(true)
    handleClose()
  }

  function handleOpenRestoreDialog(): void {
    setOpenDeleteDialog(true)
    handleClose()
  }

  function handleCloseDeleteDialog(): void {
    setOpenRestoreDialog(false)
  }

  function handleCloseRestoreDialog(): void {
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

  async function handleRestore(): Promise<void> {
    try {
      await restoreJourney()
      handleCloseRestoreDialog()
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
    <>
      <MenuItem
        sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}
        onClick={handleOpenRestoreDialog}
      >
        <ListItemIcon>
          <CheckCircleRoundedIcon color="secondary" />
        </ListItemIcon>
        <ListItemText>
          <Typography variant="body1" sx={{ pl: 2 }}>
            Restore
          </Typography>
        </ListItemText>
      </MenuItem>

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
        open={openRestoreDialog}
        handleClose={handleCloseRestoreDialog}
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
