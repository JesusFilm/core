import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface BackgroundVideoSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function BackgroundVideoSection({
  cardBlockId: _cardBlockId
}: BackgroundVideoSectionProps): ReactElement {
  return (
    <Box data-testid="BackgroundVideoSection">
      <Typography variant="h6">Background Video</Typography>
    </Box>
  )
}
