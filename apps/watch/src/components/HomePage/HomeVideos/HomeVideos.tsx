import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { VideoCard } from '../../VideoCard'

interface VideoListGridProps {
  data: VideoChildFields[]
  loading?: boolean
}

export function HomeVideos({ data }: VideoListGridProps): ReactElement {
  return (
    <Grid container spacing="14px" data-testid="video-list-grid">
      {(data?.length ?? 0) > 0 &&
        data?.map((item, index) => (
          <Grid item key={index} xs={12} md={4} xl={3}>
            <VideoCard video={item} variant="contained" />
          </Grid>
        ))}
    </Grid>
  )
}
