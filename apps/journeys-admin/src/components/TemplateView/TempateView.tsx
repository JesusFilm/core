import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StrategySection } from './StrategySection'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  return (
    <Box>
      <Typography variant="h1">Template View</Typography>
      <Box sx={{ p: 4 }}>
        {journey?.strategySlug != null && (
          <StrategySection strategySlug={journey?.strategySlug} />
        )}
      </Box>
    </Box>
  )
}
