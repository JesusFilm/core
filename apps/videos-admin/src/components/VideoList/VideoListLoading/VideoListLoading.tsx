import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

export function VideoListLoading(): ReactElement {
  return (
    <Box sx={{ height: '80cqh' }}>
      <Skeleton height="100%" width="100%" variant="rounded" />
    </Box>
  )
}
