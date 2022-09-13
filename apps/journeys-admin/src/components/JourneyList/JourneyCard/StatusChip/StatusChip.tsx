import { ReactElement } from 'react'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import EditIcon from '@mui/icons-material/Edit'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'

export interface StatusChipProps {
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

  return currentStatus != null ? (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      {currentStatus.icon}
      <Typography
        color={
          currentStatus.journeyStatus === JourneyStatus.trashed
            ? 'error'
            : undefined
        }
        variant="caption"
      >
        {currentStatus.text}
      </Typography>
    </Stack>
  ) : (
    <></>
  )
}
