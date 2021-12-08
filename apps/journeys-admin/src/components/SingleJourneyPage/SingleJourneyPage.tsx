import { ReactElement } from 'react'
import moment from 'moment'
import { Box, Typography } from '@mui/material'
import JourneysAppBar from '../JourneysAppBar'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'

interface SingleJourneyPageProps {
  journey: Journey
}

const SingleJourneyPage = ({
  journey
}: SingleJourneyPageProps): ReactElement => {
  // TODO: Extract out into seperate utils helper
  const date =
    moment(journey.createdAt).format('YYYY') === moment().format('YYYY')
      ? moment(journey.createdAt).format('MMM Do')
      : moment(journey.createdAt).format('MMM Do, YYYY')

  return (
    <>
      <JourneysAppBar journey={journey} />
      <Box sx={{ m: 10 }}>
        <Typography variant={'body2'}>{date}</Typography>
        <Typography variant={'h3'}>{journey.title}</Typography>
        <Typography variant={'body2'}>{journey.description}</Typography>
        <Typography variant={'caption'} data-testid={'status'}>
          {journey.status[0].toUpperCase() + journey.status.slice(1)}
        </Typography>
        <Typography variant={'caption'}>{journey.locale}</Typography>
      </Box>
    </>
  )
}

export default SingleJourneyPage
