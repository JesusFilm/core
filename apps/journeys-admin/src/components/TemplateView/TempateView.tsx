import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { StrategySlugUpdateForm } from '../Editor/StrategySlugUpdateForm'

export function TemplateView(): ReactElement {
  const { journey } = useJourney()
  return (
    <Box>
      <Typography variant="h1">Template View</Typography>
    </Box>
  )
}
