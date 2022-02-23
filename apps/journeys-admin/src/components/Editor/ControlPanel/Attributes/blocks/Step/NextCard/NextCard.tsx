import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { Conditions } from './Conditions'

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
      <Divider />
      <Box sx={{ px: 6, py: 4 }}>
        <Box>Cards</Box>
      </Box>
      <Divider />
      <Box sx={{ px: 6, py: 4 }}>
        <Box>Conditions</Box>
        <Conditions />
      </Box>
    </>
  )
}
