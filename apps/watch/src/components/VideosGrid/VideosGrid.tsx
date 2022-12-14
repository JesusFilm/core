import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

interface VideosGridProps {
  videos?: VideoChildFields[]
  loading?: boolean
  isEnd?: boolean
  showLoadMore?: boolean
  onLoadMore?: () => Promise<void>
  containerSlug?: string
}

export function VideosGrid({
  loading = false,
  isEnd = false,
  onLoadMore,
  showLoadMore = onLoadMore !== undefined,
  videos,
  containerSlug
}: VideosGridProps): ReactElement {
  return (
    <Grid container spacing="14px" data-testid="videos-grid">
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => (
          <Grid item key={index} xs={12} md={4} xl={3}>
            <VideoCard
              video={video}
              containerSlug={containerSlug}
              variant="expanded"
            />
          </Grid>
        ))}
      {loading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <Grid
            item
            key={index}
            md={4}
            sm={6}
            xs={12}
            data-testid="videos-grid-placeholder"
            gap="10px 16px"
          >
            <VideoCard variant="expanded" />
          </Grid>
        ))}
      {!isEnd && showLoadMore && (
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
