import Box from '@mui/material/Box'
import { ReactElement, Suspense } from 'react'

import { VideoList } from '../../components/client/VideoList'
import { VideoListFallback } from '../../components/client/VideoList/VideoListFallback'
import { VideoListHead } from '../../components/server/VideoListHead'

export default function Index(): ReactElement {
  return (
    <Box>
      <Suspense fallback={<VideoListFallback />}>
        <VideoList header={<VideoListHead />} />
      </Suspense>
    </Box>
  )
}
