'use client'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { ReactElement } from 'react'

export default function TroubleshootingLoading(): ReactElement {
  return (
    <Box
      sx={{
        height: '100%',
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        p: 4
      }}
      data-testid="troubleshooting-loading"
    >
      <CircularProgress />
    </Box>
  )
}
