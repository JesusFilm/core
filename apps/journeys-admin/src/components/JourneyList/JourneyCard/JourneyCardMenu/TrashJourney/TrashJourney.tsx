import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { useSnackbar } from 'notistack'
import { JourneyTrash } from '../../../../../../__generated__/JourneyTrash'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'

export const JOURNEY_TRASH = gql`
  mutation JourneyTrash($ids: [ID!]!) {
    journeysTrash(ids: $ids) {
      id
      status
    }
  }
`

interface TrashJourneyProps {
  id: string
  handleClose: () => void
}

export function TrashJourney({
  id,
  handleClose
}: TrashJourneyProps): ReactElement {
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

  async function handleClick(): Promise<void> {
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
    <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }} onClick={handleClick}>
      <ListItemIcon>
        <DeleteOutlineRoundedIcon color="secondary" />
      </ListItemIcon>
      <ListItemText>
        <Typography variant="body1" sx={{ pl: 2 }}>
          Delete
        </Typography>
      </ListItemText>
    </MenuItem>
  )
}
