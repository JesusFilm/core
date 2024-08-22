import Box from '@mui/material/Box'
import { ReactElement, Suspense } from 'react'

import { VideoList } from '../../components/client/VideoList'

export default function Index(): ReactElement {
  return (
    <Box>
      <Suspense>
        <VideoList />
      </Suspense>
    </Box>
  )
}
