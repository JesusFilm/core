import { ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import JourneysAppBar from '../JourneysAppBar'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'

interface SingleJourneyProps {
  journey: Journey
}

const SingleJourney = ({ journey }: SingleJourneyProps): ReactElement => {
  return (
    <>
      <JourneysAppBar journey={journey} />
      <Box sx={{ m: 8, mt: 18 }}>
        <Typography variant={'h4'}>{journey.title}</Typography>
        <Typography variant={'body1'}>{journey.description}</Typography>
      </Box>
    </>
  )
}

export default SingleJourney
