import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import EventRounded from '@mui/icons-material/EventRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../libs/context'

export function JourneyDetails(): ReactElement {
  const journey = useJourney()

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {journey != null ? (
          <>
            {journey.status === JourneyStatus.published ? (
              <CheckCircleRounded color="success" fontSize="small" />
            ) : (
              <EditRounded color="warning" fontSize="small" />
            )}
          </>
        ) : (
          <EditRounded fontSize="small" />
        )}
        <Typography variant="body2" data-testid="status" sx={{ ml: 2 }}>
          {journey != null ? (
            journey.status === JourneyStatus.published ? (
              'Published'
            ) : (
              'Draft'
            )
          ) : (
            <Skeleton variant="text" width={30} />
          )}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
        <EventRounded fontSize="small" />
        <Typography
          variant="body2"
          data-testid="created-at-date"
          sx={{ ml: 2 }}
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
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
        <TranslateRounded fontSize="small" />
        <Typography variant="body2" sx={{ ml: 2 }}>
          {journey != null ? (
            journey.language.name.find(({ primary }) => primary)?.value
          ) : (
            <Skeleton variant="text" width={40} />
          )}
        </Typography>
      </Box>
    </>
  )
}
