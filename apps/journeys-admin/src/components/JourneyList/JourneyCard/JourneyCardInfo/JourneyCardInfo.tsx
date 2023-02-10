import { ReactElement } from 'react'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import EditIcon from '@mui/icons-material/Edit'
import TranslateIcon from '@mui/icons-material/Translate'
import Stack from '@mui/material/Stack'
import { AccessAvatars } from '../../../AccessAvatars'
import { StatusChip } from '../StatusChip'

import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'
import { JourneyCardVariant } from '../JourneyCard'

interface Props {
  journey?: Journey
  variant: JourneyCardVariant
}

export function JourneyCardInfo({ journey }: Props): ReactElement {
  return (
    <Stack direction="row" alignItems="center" spacing={4} flexGrow={1}>
      {/* TODO: show inviter avatar/ avatars requiring action */}
      <AccessAvatars
        journeyId={journey?.id}
        userJourneys={journey?.userJourneys ?? undefined}
      />
      {/* TODO: End */}
      {/* TODO: Update text */}
      {journey != null ? (
        <StatusChip status={journey.status} />
      ) : (
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <EditIcon sx={{ fontSize: 13 }} />
          <Typography variant="caption">
            <Skeleton variant="text" width={30} />
          </Typography>
        </Stack>
      )}
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <TranslateIcon sx={{ fontSize: 13 }} />
        <Typography variant="caption">
          {journey != null ? (
            journey.language.name.find(({ primary }) => primary)?.value
          ) : (
            <Skeleton variant="text" width={40} />
          )}
        </Typography>
      </Stack>
      {/* TODO: End */}
    </Stack>
  )
}
