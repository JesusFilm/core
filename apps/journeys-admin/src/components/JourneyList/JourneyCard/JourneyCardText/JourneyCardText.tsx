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
  const nativeLanguageName = journey.language.name.find(
    ({ primary }) => primary
  )?.value

  return (
    <Stack spacing={0.4}>
      <Typography
        variant="subtitle1"
        gutterBottom
        sx={{
          fontSize: 16,
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
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{ width: '100%' }}
      >
        <Globe1Icon sx={{ fontSize: 15, color: 'secondary.light' }} />
        <Typography
          variant="body2_responsive"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {nativeLanguageName}
        </Typography>
        <Typography variant="body2" sx={{ mx: 1 }}>
          •
        </Typography>
        <Typography
          variant="body2"
          sx={{
            flex: '0 0 auto',
            whiteSpace: 'nowrap',
            color: 'secondary.main'
          }}
          noWrap
          suppressHydrationWarning
        >
          <LastModifiedDate modifiedDate={journey.updatedAt} />
        </Typography>
      </Stack>
    </Stack>
  )
}
