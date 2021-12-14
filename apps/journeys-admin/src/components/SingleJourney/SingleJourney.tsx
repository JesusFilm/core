import { ReactElement, useContext } from 'react'
import { Box, Divider, Typography } from '@mui/material'
import JourneysAppBar from '../JourneysAppBar'
import { Properties } from './Properties'
import { JourneyContext } from './Context'
import CardOverview from './CardOverview'
import { useBreakpoints } from '@core/shared/ui'
import { TreeBlock } from '@core/journeys/ui'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'

const SingleJourney = (): ReactElement => {
  const journey = useContext(JourneyContext)
  const breakpoints = useBreakpoints()
  const blocks = journey.blocks != null ? journey.blocks : []

  return (
    <Box sx={{ mr: breakpoints.md ? '328px' : 0 }}>
      <JourneysAppBar journey={journey} />
      <Box sx={{ p: 8, pt: 18, backgroundColor: 'background.paper' }}>
        <Typography variant={'h4'}>{journey.title}</Typography>
        <Typography variant={'body1'}>{journey.description}</Typography>
      </Box>
      <Divider />
      <Properties />
      <CardOverview
        slug={journey.slug}
        blocks={blocks as Array<TreeBlock<StepBlock>>}
      />
    </Box>
  )
}

export default SingleJourney
