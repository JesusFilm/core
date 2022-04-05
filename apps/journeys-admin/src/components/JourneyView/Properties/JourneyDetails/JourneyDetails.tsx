import { isThisYear, parseISO, intlFormat } from 'date-fns'
import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded'
import EditRounded from '@mui/icons-material/EditRounded'
import EventRounded from '@mui/icons-material/EventRounded'
import TranslateRounded from '@mui/icons-material/TranslateRounded'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../libs/context'

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
    </>
  )
}
