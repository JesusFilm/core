import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import type { TreeBlock } from '@core/journeys/ui/block'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { Properties } from './Properties'
import { CardView } from './CardView'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Stack sx={{ p: { xs: 6, sm: 8 }, backgroundColor: 'background.paper' }}>
        <Typography variant="h1">
          {journey != null ? (
            journey.title
          ) : (
            <Skeleton variant="text" width="60%" />
          )}
        </Typography>
        <Typography variant="body2">
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Stack>
      <Properties />
      <>
        <CardView blocks={blocks} />
      </>
    </Box>
  )
}
