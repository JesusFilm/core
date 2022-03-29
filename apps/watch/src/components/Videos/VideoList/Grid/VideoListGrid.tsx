import { ReactElement } from 'react'
import { Button, Grid } from '@mui/material'
import { AddRounded } from '@mui/icons-material'
import LoadingButton from '@mui/lab/LoadingButton'

import { GetVideos_videos } from '../../../../../__generated__/GetVideos'
import { VideoListCard } from '../Card/VideoListCard'

interface VideoListGridProps {
  videos: GetVideos_videos[]
  loading?: boolean
  isEnd?: boolean
  onLoadMore: () => Promise<void>
}

export function VideoListGrid({
  loading = false,
  isEnd = false,
  onLoadMore,
  videos
}: VideoListGridProps): ReactElement {
  return (
    <Grid container spacing={4}>
      {(videos.length ?? 0) > 0 &&
        videos.map((video, index) => (
          <Grid item key={index} md={4} sm={6} xs={12} lg={3}>
            <VideoListCard video={video} />
          </Grid>
        ))}
      {loading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <Grid item key={index} md={4} sm={6} xs={12}>
            <VideoListCard />
          </Grid>
        ))}
      {!isEnd && (
        <Grid item xs={12}>
          <LoadingButton
            data-testid="VideoListLoadMore"
            variant="outlined"
            onClick={onLoadMore}
            loading={loading}
            startIcon={
              (videos?.length ?? 0) > 0 && !isEnd ? null : <AddRounded />
            }
            disabled={(videos?.length ?? 0) === 0 || isEnd}
            loadingPosition="start"
            size="medium"
          >
            {loading && 'Loading...'}
            {!loading &&
              ((videos?.length ?? 0) > 0 && !isEnd
                ? 'Load More'
                : 'No More Videos')}
          </LoadingButton>
        </Grid>
      )}
    </Grid>
  )
}
