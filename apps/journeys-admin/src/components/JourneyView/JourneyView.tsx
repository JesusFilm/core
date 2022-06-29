import { ReactElement } from 'react'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import Fab from '@mui/material/Fab'
import Skeleton from '@mui/material/Skeleton'
import NextLink from 'next/link'
import Divider from '@mui/material/Divider'
import { JourneysReportType } from '../../../__generated__/globalTypes'
import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { DynamicPowerBiReport } from '../DynamicPowerBiReport'
import { Properties } from './Properties'
import { CardView } from './CardView'

export function JourneyView(): ReactElement {
  const { journey } = useJourney()
  const blocks =
    journey?.blocks != null
      ? (transformer(journey.blocks) as Array<TreeBlock<StepBlock>>)
      : undefined

  return (
    <Box sx={{ mr: { sm: '328px' }, mb: '80px' }}>
      <Box sx={{ p: { xs: 6, sm: 8 }, backgroundColor: 'background.paper' }}>
        <Typography variant="h4">
          {journey != null ? (
            journey.title
          ) : (
            <Skeleton variant="text" width="60%" />
          )}
        </Typography>
        <Typography variant="body1">
          {journey != null ? (
            journey.description
          ) : (
            <Skeleton variant="text" width="80%" />
          )}
        </Typography>
      </Box>

      <Properties />

      <Box sx={{ height: '213px', pb: '23' }}>
        <DynamicPowerBiReport reportType={JourneysReportType.singleSummary} />
        <Divider />
      </Box>
      <>
        <CardView id={journey?.id} blocks={blocks} />
        <NextLink
          href={journey != null ? `/journeys/${journey.id}/edit` : ''}
          passHref
        >
          <Fab
            variant="extended"
            size="large"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: { xs: 20, sm: 348 }
            }}
            color="primary"
            disabled={journey == null}
          >
            <EditIcon sx={{ mr: 3 }} />
            Edit
          </Fab>
        </NextLink>
      </>
    </Box>
  )
}
