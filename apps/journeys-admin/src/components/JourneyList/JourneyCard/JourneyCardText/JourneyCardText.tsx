import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { GetAdminJourneys_journeys as Journey } from '../../../../../__generated__/GetAdminJourneys'

import { LastModifiedDate } from './LastModifiedDate'

interface JourneyCardTextProps {
  journey: Journey
}

export function JourneyCardText({
  journey
}: JourneyCardTextProps): ReactElement {
  return (
    <>
      <Typography
        variant="subtitle1"
        component="div"
        gutterBottom
        sx={{
          color: 'secondary.main',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: '2',
          WebkitBoxOrient: 'vertical'
        }}
      >
        {journey.title}
      </Typography>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Globe1Icon sx={{ fontSize: 13 }} />
        <Typography variant="caption">
          {journey.language.name.find(({ primary }) => primary)?.value}
        </Typography>
        <Typography variant="caption" sx={{ mx: 1 }}>
          •
        </Typography>
        <Typography
          variant="caption"
          noWrap
          sx={{
            display: 'block',
            color: 'secondary.main'
          }}
          suppressHydrationWarning
        >
          <LastModifiedDate modifiedDate={journey.updatedAt} />
        </Typography>
      </Stack>
    </>
  )
}
