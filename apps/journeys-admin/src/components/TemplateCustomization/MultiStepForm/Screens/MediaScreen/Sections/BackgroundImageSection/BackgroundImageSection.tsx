import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface BackgroundImageSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function BackgroundImageSection({
  cardBlockId: _cardBlockId
}: BackgroundImageSectionProps): ReactElement {
  return (
    <Box data-testid="BackgroundImageSection">
      <Typography variant="h6">Background Image</Typography>
    </Box>
  )
}
