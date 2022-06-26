import { ReactElement } from 'react'
import MenuItem from '@mui/material/MenuItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import UnarchiveRoundedIcon from '@mui/icons-material/UnarchiveRounded'
import Typography from '@mui/material/Typography'
import { JourneyStatus } from '../../../../../../__generated__/globalTypes'

interface ArchiveJourneyProps {
  status: JourneyStatus
  id: string
}

// Mutations
// Snackbar

export function ArchiveJourney({
  status,
  id
}: ArchiveJourneyProps): ReactElement {
  return (
    <MenuItem sx={{ pl: 7, pr: 17, pt: 4, pb: 4 }}>
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
