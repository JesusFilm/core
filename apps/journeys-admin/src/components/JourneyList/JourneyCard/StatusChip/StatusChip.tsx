import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import CheckBrokenIcon from '@core/shared/ui/icons/CheckBroken'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import FolderDown1Icon from '@core/shared/ui/icons/FolderDown1'
import XCircleContainedIcon from '@core/shared/ui/icons/XCircleContained'

import { JourneyStatus } from '../../../../../__generated__/globalTypes'

export interface StatusChipProps {
  status: JourneyStatus
}

const options = [
  {
    journeyStatus: JourneyStatus.draft,
    text: 'Draft',
    icon: <Edit2Icon color="warning" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.published,
    text: 'Published',
    icon: <CheckBrokenIcon color="success" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.archived,
    text: 'Archived',
    icon: <FolderDown1Icon color="disabled" sx={{ fontSize: 13 }} />
  },
  {
    journeyStatus: JourneyStatus.trashed,
    text: 'Trash',
    icon: <XCircleContainedIcon color="error" sx={{ fontSize: 13 }} />
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
