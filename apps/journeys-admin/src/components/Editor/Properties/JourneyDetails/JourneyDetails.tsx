import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Calendar1Icon from '@core/shared/ui/icons/Calendar1'
import Globe1Icon from '@core/shared/ui/icons/Globe1'

import { Language } from './Language'

interface JourneyDetailsProps {
  isPublisher?: boolean
}

export function JourneyDetails({
  isPublisher
}: JourneyDetailsProps): ReactElement {
  const { journey } = useJourney()

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        <Calendar1Icon fontSize="small" />
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
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          mt: 2
        }}
      >
        <Globe1Icon fontSize="small" />
        <Language />
      </Box>
    </>
  )
}
