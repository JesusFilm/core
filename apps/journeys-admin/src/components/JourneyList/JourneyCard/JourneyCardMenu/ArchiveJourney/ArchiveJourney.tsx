import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import Typography from '@mui/material/Typography'
import { useSnackbar } from 'notistack'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../__generated__/JourneyUnarchive'

export const JOURNEY_ARCHIVE = gql`
  mutation JourneyArchive($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
      status
    }
  }
`

export const JOURNEY_UNARCHIVE = gql`
  mutation JourneyUnarchive($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
      status
    }
  }
`

interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
}

export function ArchiveJourney({
  status,
  id
}: ArchiveJourneyProps): ReactElement {
  const [archiveJourney] = useMutation<JourneyArchive>(JOURNEY_ARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysArchive: [
        {
          id,
          status: JourneyStatus.archived,
          __typename: 'Journey'
        }
      ]
    }
  })
  const [unarchiveJourney] = useMutation<JourneyUnarchive>(JOURNEY_UNARCHIVE, {
    variables: {
      ids: [id]
    },
    optimisticResponse: {
      journeysRestore: [
        {
          id,
          status: JourneyStatus.draft,
          __typename: 'Journey'
        }
      ]
    }
  })

  const { enqueueSnackbar } = useSnackbar()

  async function handleClick(): Promise<void> {
    try {
      if (status !== JourneyStatus.archived) {
        await archiveJourney()
        enqueueSnackbar('Journey Archived', {
          variant: 'success',
          preventDuplicate: true
        })
      } else {
        await unarchiveJourney()
        enqueueSnackbar('Journey Unarchived', {
          variant: 'success',
          preventDuplicate: true
        })
      }
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: 'error',
        preventDuplicate: true
      })
    }
  }

  return (
    <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }} onClick={handleClick}>
      {status !== JourneyStatus.archived ? (
        <>
          <ListItemIcon>
            <ArchiveRoundedIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Archive
            </Typography>
          </ListItemText>
        </>
      ) : (
        <>
          <ListItemIcon>
            <UnarchiveRoundedIcon color="secondary" />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body1" sx={{ pl: 2 }}>
              Unarchive
            </Typography>
          </ListItemText>
        </>
      )}
    </MenuItem>
  )
}
