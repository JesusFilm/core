import { ReactElement, useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import { useSnackbar } from 'notistack'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
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

interface RestoreJourneyProps {
  id: string
  published: boolean
  handleClose: () => void
}

export function RestoreJourney({
  id,
  published,
  handleClose
}: RestoreJourneyProps): ReactElement {
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

  const [openRestoreDialog, setOpenRestoreDialog] = useState(false)

  function handleOpenRestoreDialog(): void {
    handleClose()
    setOpenRestoreDialog(true)
  }

  function handleCloseRestoreDialog(): void {
    setOpenRestoreDialog(false)
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
    </>
  )
}
