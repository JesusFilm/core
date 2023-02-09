import { ReactElement } from 'react'
import { parseISO, isThisYear, intlFormat } from 'date-fns'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { GetJourneys_journeys as Journey } from '../../../../../__generated__/GetJourneys'

interface Props {
  journey?: Journey
}

export function JourneyCardText({ journey }: Props): ReactElement {
  return (
    <>
      {/* TODO: add badge */}
      <Typography
        variant="subtitle1"
        component="div"
        noWrap
        gutterBottom
        sx={{ color: 'secondary.main' }}
      >
        {journey != null ? (
          journey.title
        ) : (
          <Skeleton variant="text" width={200} />
        )}
      </Typography>
      {/* TODO: End */}
      <Typography
        variant="caption"
        noWrap
        sx={{
          display: 'block',
          color: 'secondary.main'
        }}
      >
        {journey != null ? (
          intlFormat(parseISO(journey.createdAt), {
            day: 'numeric',
            month: 'long',
            year: isThisYear(parseISO(journey.createdAt))
              ? undefined
              : 'numeric'
          })
        ) : (
          <Skeleton variant="text" width={120} />
        )}
        {journey?.description != null && ` - ${journey.description}`}
      </Typography>
    </>
  )
}
