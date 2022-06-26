import { ReactElement } from 'react'
import { useMutation, gql } from '@apollo/client'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import Typography from '@mui/material/Typography'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'
import { JourneyArchive } from '../../../../../../__generated__/JourneyArchive'
import { JourneyUnarchive } from '../../../../../../__generated__/JourneyUnarchive'

export const JOURNEY_ARCHIVE = gql`
  mutation JourneyArchive($ids: [ID!]!) {
    journeysArchive(ids: $ids) {
      id
    }
  }
`

export const JOURNEY_UNARCHIVE = gql`
  mutation JourneyUnarchive($ids: [ID!]!) {
    journeysRestore(ids: $ids) {
      id
    }
  }
`

interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
}

// Snackbar

export function ArchiveJourney({
  status,
  id
}: ArchiveJourneyProps): ReactElement {
  const [archiveJourney] = useMutation<JourneyArchive>(JOURNEY_ARCHIVE)
  const [unarchiveJourney] = useMutation<JourneyUnarchive>(JOURNEY_UNARCHIVE)

  // need to catch role check error

  async function handleClick(): Promise<void> {
    if (status !== JourneyStatus.archived) {
      await archiveJourney({
        variables: {
          ids: [id]
        },
        optimisticResponse: {
          journeysArchive: [
            {
              id,
              __typename: 'Journey'
            }
          ]
        }
      })
    } else {
      await unarchiveJourney({
        variables: {
          ids: [id]
        },
        optimisticResponse: {
          journeysRestore: [
            {
              id,
              __typename: 'Journey'
            }
          ]
        }
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
