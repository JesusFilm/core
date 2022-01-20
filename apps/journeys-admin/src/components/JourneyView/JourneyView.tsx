import { ReactElement } from 'react'
import { useBreakpoints } from '@core/shared/ui'
import { transformer, TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { JourneysAppBar } from '../JourneysAppBar'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { Properties } from './Properties'
import { useJourney } from './Context'
import { CardView } from './CardView'

export function JourneyView(): ReactElement {
  const journey = useJourney()
  const breakpoints = useBreakpoints()
  const blocks = journey.blocks != null ? transformer(journey.blocks) : []

  return (
    <Box sx={{ mr: breakpoints.md ? '328px' : 0 }}>
      <JourneysAppBar variant="view" />
      <Box sx={{ p: 8, pt: 20, backgroundColor: 'background.paper' }}>
        <Typography variant="h4">{journey.title}</Typography>
        <Typography variant="body1">{journey.description}</Typography>
      </Box>
      <Properties />
      <CardView
        slug={journey.slug}
        blocks={blocks as Array<TreeBlock<StepBlock>>}
      />
    </Box>
  )
}
