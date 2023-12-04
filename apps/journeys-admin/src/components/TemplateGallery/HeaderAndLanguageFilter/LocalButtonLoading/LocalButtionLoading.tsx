import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'

export function LocalButtonLoading(): ReactElement {
  return (
    <Skeleton
      sx={{ width: { xs: 145, md: 274 }, height: { xs: 30, md: 36 } }}
    />
  )
}
