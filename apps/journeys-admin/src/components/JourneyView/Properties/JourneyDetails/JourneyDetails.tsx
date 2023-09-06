import TranslateRounded from '@mui/icons-material/TranslateRounded' // icon-replace: no icon serves similar purpose
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { intlFormat, isThisYear, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Calendar1 from '@core/shared/ui/icons/Calendar1'

import type { JourneyType } from '../../JourneyView'

import { Language } from './Language'

interface JourneyDetailsProps {
  journeyType: JourneyType
  isPublisher?: boolean
}

export function JourneyDetails({
  journeyType,
  isPublisher
}: JourneyDetailsProps): ReactElement {
  const { journey } = useJourney()

  return (
    <>
      {journeyType === 'Template' ? (
        <Language isPublisher={isPublisher} />
      ) : (
        <>
          <Box sx={{ display: 'flex', flexDirection: 'row' }}>
            <Calendar1 fontSize="small" />
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
            <TranslateRounded fontSize="small" />
            <Language />
          </Box>
        </>
      )}
    </>
  )
}
