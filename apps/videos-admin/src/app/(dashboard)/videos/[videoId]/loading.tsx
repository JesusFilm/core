'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement } from 'react'

export default function MetadataLoading(): ReactElement {
  return (
    <Box sx={{ height: 240, display: 'grid', placeItems: 'center' }}>
      <CircularProgress />
    </Box>
  )
}
