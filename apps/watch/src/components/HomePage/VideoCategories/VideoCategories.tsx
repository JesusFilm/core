import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { VideoCard } from '../../VideoCard'

interface VideoCategoriesProps {
  videos?: any[]
}

export function VideoCategories({
  videos
}: VideoCategoriesProps): ReactElement {
  return (
    <Grid container data-testid="videos-categories">
      {(videos?.length ?? 0) > 0 &&
        videos?.map((category, index) => (
          <Stack key={`stack-${index}`} padding={4} spacing={4}>
            <Typography color="textPrimary" variant="h6" component="h3">
              {' '}
              {category.category}{' '}
            </Typography>
            <Stack direction="row" spacing={4}>
              {category.videos.map((video, vIndex) => (
                <Grid item key={index} xs={12} md={4} xl={3}>
                  <VideoCard key={vIndex} video={video} />
                </Grid>
              ))}
            </Stack>
          </Stack>
        ))}
    </Grid>
  )
}
