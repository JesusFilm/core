import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface CardsSectionProps {
  onChange: (cardBlockId: string | null) => void
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function CardsSection({ onChange: _onChange }: CardsSectionProps): ReactElement {
  return (
    <Box data-testid="CardsSection">
      <Typography variant="h6">Cards</Typography>
    </Box>
  )
}
