import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import EditIcon from '@mui/icons-material/Edit'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import Typography from '@mui/material/Typography'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

interface StatusChipProps {
  status: JourneyStatus
}

const options = [
  {
    journeyStatus: JourneyStatus.draft,
    text: 'Draft',
    icon: <EditIcon color="warning" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.published,
    text: 'Published',
    icon: <CheckCircleRoundedIcon color="success" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.archived,
    text: 'Archived',
    icon: <ArchiveRoundedIcon color="disabled" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.trashed,
    text: 'Trash',
    icon: <CancelRoundedIcon color="error" sx={{ fontSize: 13 }} />
  }
]

export function StatusChip({ status }: StatusChipProps): ReactElement {
  const currentStatus = options.find(
    (option) => option.journeyStatus === status
  )

  return (
    <>
      {currentStatus != null ? (
        <>
          <Grid item>{currentStatus.icon}</Grid>
          <Grid item>
            <Typography variant="caption">{currentStatus.text}</Typography>
          </Grid>
        </>
      ) : (
        <></>
      )}
    </>
  )
}
