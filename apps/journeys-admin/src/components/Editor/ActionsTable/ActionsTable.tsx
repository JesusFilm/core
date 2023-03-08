import { ReactElement } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { JourneyFields_blocks as blocks } from '../../../../__generated__/JourneyFields'

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()

  const actions = journey?.blocks
    .filter((b) => b.action != null)
    .map((b) => b.action)
    .filter((a) => ['LinkAction'].includes(a.__typename))

  return (
    <Box>
      {actions?.map((action, i) => (
        <Typography key={i} sx={{ pb: 2 }}>
          {action.url}
        </Typography>
      ))}
    </Box>
  )
}
