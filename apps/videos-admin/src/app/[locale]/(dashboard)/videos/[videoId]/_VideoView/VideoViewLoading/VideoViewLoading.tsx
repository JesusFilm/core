'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement } from 'react'

export function VideoViewLoading(): ReactElement {
  return (
    <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  )
}
