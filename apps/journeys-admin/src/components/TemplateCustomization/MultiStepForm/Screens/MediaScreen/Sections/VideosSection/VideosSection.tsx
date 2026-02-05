import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface VideosSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function VideosSection({ cardBlockId: _cardBlockId }: VideosSectionProps): ReactElement {
  return (
    <Box data-testid="VideosSection">
      <Typography variant="h6">Video</Typography>
    </Box>
  )
}
