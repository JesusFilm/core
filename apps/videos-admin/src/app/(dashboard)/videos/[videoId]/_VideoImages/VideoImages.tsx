import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/GridLegacy'
import Typography from '@mui/material/Typography'
import { ReactElement, Suspense } from 'react'

import { BannerImage } from './BannerImage'
import { HdImage } from './HdImage'

interface VideoImagesProps {
  videoId: string
}

function Loading(): ReactElement {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
      <CircularProgress />
    </Box>
  )
}

export function VideoImages({ videoId }: VideoImagesProps): ReactElement {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" gutterBottom>
          Banner Image (1280x600)
        </Typography>
        <Suspense fallback={<Loading />}>
          <BannerImage videoId={videoId} />
        </Suspense>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="subtitle2" gutterBottom>
          HD Image (1920x1080)
        </Typography>
        <Suspense fallback={<Loading />}>
          <HdImage videoId={videoId} />
        </Suspense>
      </Grid>
    </Grid>
  )
}
