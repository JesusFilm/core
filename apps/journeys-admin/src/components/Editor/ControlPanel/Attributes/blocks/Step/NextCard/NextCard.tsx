import { ReactElement } from 'react'
import { Box } from '@mui/material'

interface NextCardProps {
  id: string
  nextBlockId: string | null
  locked: boolean
}

export function NextCard({
  id,
  nextBlockId,
  locked
}: NextCardProps): ReactElement {
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>Cards</Box>
      <Box sx={{ px: 6, py: 4 }}>Conditions</Box>
    </>
  )
}
