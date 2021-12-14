import { ReactElement, useContext } from 'react'
import { Box, Typography } from '@mui/material'
import JourneysAppBar from '../JourneysAppBar'
// import Properties from './Properties'
import { JourneyContext } from './Context'

const SingleJourney = (): ReactElement => {
  const journey = useContext(JourneyContext)

  return (
    <>
      <JourneysAppBar journey={journey} />
      <Box sx={{ m: 8, mt: 18 }}>
        <Typography variant={'h4'}>{journey.title}</Typography>
        <Typography variant={'body1'}>{journey.description}</Typography>
      </Box>
      {/* <Properties journey={journey} /> */}
    </>
  )
}

export default SingleJourney
