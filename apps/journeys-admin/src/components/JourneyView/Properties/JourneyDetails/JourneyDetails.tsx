import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import {
  CheckCircleRounded,
  EditRounded,
  EventRounded,
  TranslateRounded
} from '@mui/icons-material'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { useJourney } from '../../Context'
import { ShareSection } from '../../ShareSection'

export function JourneyDetails(): ReactElement {
  const journey = useJourney()

  const date = parseISO(journey.createdAt)
  const formattedDate = intlFormat(date, {
    day: 'numeric',
    month: 'long',
    year: isThisYear(date) ? undefined : 'numeric'
  })

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {journey.status === JourneyStatus.published ? (
          <CheckCircleRounded color="success" fontSize="small" />
        ) : (
          <EditRounded color="warning" fontSize="small" />
        )}
        <Typography variant="body2" data-testid="status" sx={{ ml: 2 }}>
          {journey.status === JourneyStatus.published ? 'Published' : 'Draft'}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
        <EventRounded fontSize="small" />
        <Typography
          variant="body2"
          data-testid="created-at-date"
          sx={{ ml: 2 }}
        >
          {formattedDate}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', mt: 2 }}>
        <TranslateRounded fontSize="small" />
        <Typography variant="body2" data-testid="locale" sx={{ ml: 2 }}>
          {journey.locale}
        </Typography>
      </Box>
      <ShareSection slug={journey.slug} />
    </>
  )
}
