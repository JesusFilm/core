import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

export function JourneyDetails(): ReactElement {
  const { journey } = useJourney()
  return (
    <Stack spacing={2} sx={{ px: 4, py: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden'
        }}
      >
        {journey?.title}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          maxWidth: 'auto',
          overflow: 'hidden',
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical'
        }}
      >
        {journey?.description}
      </Typography>
    </Stack>
  )
}
