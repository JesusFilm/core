import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StrategySection } from './StrategySection'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  return (
    <Stack>
      <Typography variant="h1">Template View</Typography>
      <Box sx={{ p: 4 }}>
        {journey?.strategySlug != null && (
          <StrategySection strategySlug={journey?.strategySlug} />
        )}
      </Box>
    </Stack>
  )
}
