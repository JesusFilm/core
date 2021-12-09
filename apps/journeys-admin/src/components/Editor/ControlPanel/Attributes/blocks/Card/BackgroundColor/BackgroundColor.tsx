import { ReactElement } from 'react'
import { Box } from '@mui/material'

interface BackgroundColorProps {
  id: string
  backgroundColor: string | null
}

export function BackgroundColor({
  id,
  backgroundColor
}: BackgroundColorProps): ReactElement {
  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>Theme</Box>
      <Box sx={{ px: 6, py: 4 }}>Custom</Box>
    </>
  )
}
