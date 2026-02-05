import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface ImagesSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function ImagesSection({ cardBlockId: _cardBlockId }: ImagesSectionProps): ReactElement {
  return (
    <Box data-testid="ImagesSection">
      <Typography variant="h6">Images</Typography>
    </Box>
  )
}
