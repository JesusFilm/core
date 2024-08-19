import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface NumberStatProps {
  label: string
  count?: number
}

export function JourneyAnalyticsCardStat({
  label,
  count = 0
}: NumberStatProps): ReactElement {
  const formatter = Intl.NumberFormat('en', { notation: 'compact' })

  return (
    <Box sx={{ px: 4 }} data-testid="JourneyAnalyticsCardStat">
      <Typography variant="overline" sx={{ color: 'secondary.light' }}>
        {label}
      </Typography>
      <Typography variant="h1">{formatter.format(count)}</Typography>
    </Box>
  )
}
