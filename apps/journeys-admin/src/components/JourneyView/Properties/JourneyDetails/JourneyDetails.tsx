import { isThisYear, parseISO, format } from 'date-fns'
import { ReactElement, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import {
  CheckCircleRounded,
  EditRounded,
  EventRounded,
  TranslateRounded
} from '@mui/icons-material'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { JourneyContext } from '../../Context'

export function JourneyDetails(): ReactElement {
  const journey = useContext(JourneyContext)

  const date = parseISO(journey.createdAt)
  const formattedDate = isThisYear(date)
    ? format(date, 'MMM do')
    : format(date, 'MMM do, yyyy')

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'row' }}>
        {journey.status === JourneyStatus.published ? (
          <CheckCircleRounded color="success" fontSize="small" />
        ) : (
          <EditRounded color="warning" fontSize="small" />
        )}
        <Typography
          variant="body2"
          data-testid="status"
          sx={{ textTransform: 'capitalize', ml: 2 }}
        >
          {journey.status}
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
