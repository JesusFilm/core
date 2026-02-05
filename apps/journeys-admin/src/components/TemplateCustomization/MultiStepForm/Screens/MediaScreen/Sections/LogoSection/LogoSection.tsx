import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

interface LogoSectionProps {
  cardBlockId: string | null
}

/**
 * TODO: update this jsdoc after you implement this component
 */
export function LogoSection({
  cardBlockId: _cardBlockId
}: LogoSectionProps): ReactElement {
  return (
    <Box data-testid="LogoSection">
      <Typography variant="h6">Logo</Typography>
    </Box>
  )
}
