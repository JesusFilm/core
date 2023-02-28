import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { VideoCard } from '../../VideoCard'

interface VideoCategoriesProps {
  videos?: VideoChildFields[]
}

export function VideoCategories({
  videos,
}: VideoCategoriesProps): ReactElement {
  return (
    <Grid
      container
      spacing={4}
      rowSpacing={4}
      data-testid="videos-categories"
    >
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => (
          <Grid item key={index} xs={12} md={4} xl={3}>
            <VideoCard
              video={video}
            />
          </Grid>
        ))}
    </Grid>
  )
}
