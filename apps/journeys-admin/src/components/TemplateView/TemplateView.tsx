import Stack from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { StrategySection } from './StrategySection'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()

  return (
    <Stack gap={4}>
      <Typography variant="h1">{journey?.title}</Typography>
      <Typography variant="body1">{journey?.description}</Typography>
      <Stack sx={{ p: 4 }}>
        {journey?.strategySlug != null && (
          <StrategySection strategySlug={journey?.strategySlug} />
        )}
      </Stack>
    </Stack>
  )
}
