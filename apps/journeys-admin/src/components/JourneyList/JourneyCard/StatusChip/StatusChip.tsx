import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Circle from '@core/shared/ui/icons/Circle'
import Edit2 from '@core/shared/ui/icons/Edit2'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'

export interface StatusChipProps {
  status: JourneyStatus
}

const options = [
  {
    journeyStatus: JourneyStatus.draft,
    text: 'Draft',
    icon: <Edit2 color="warning" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.published,
    text: 'Published',
    icon: <Circle color="success" sx={{ fontSize: 13 }} />
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
