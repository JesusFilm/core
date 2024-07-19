import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { ComponentProps, ReactElement } from 'react'

import { useHits } from 'react-instantsearch'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'
import { transformAlgoliaVideos } from '../VideosPage/utils/transformAlgoliaVideos'

interface VideoGridProps {
  videos?: VideoChildFields[]
  loading?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => void
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
}

export function VideoGrid({
  loading,
  hasNextPage,
  onLoadMore,
  videos: localVideos,
  containerSlug,
  variant = 'expanded'
}: VideoGridProps): ReactElement {
  const { hits } = useHits({
    transformItems: transformAlgoliaVideos
  })

  const videos = hits.length > 0 ? hits : localVideos

  return (
    <Grid
      container
      spacing={4}
      rowSpacing={variant === 'expanded' ? 8 : 4}
      data-testid="VideoGrid"
    >
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => (
          <Grid item key={index} xs={12} md={4} xl={3}>
            <VideoCard
              video={video}
              containerSlug={containerSlug}
              variant={variant}
            />
          </Grid>
        ))}
      {loading === true && (
        <>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard variant={variant} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            xl={3}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <VideoCard variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            xl={3}
            sx={{ display: { xs: 'none', xl: 'block' } }}
          >
            <VideoCard variant={variant} />
          </Grid>
        </>
      )}
      {onLoadMore != null && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <LoadingButton
              variant="outlined"
              onClick={onLoadMore}
              loading={loading}
              startIcon={<AddRounded />}
              disabled={hasNextPage !== true}
              loadingPosition="start"
              size="medium"
            >
              {loading === true
                ? 'Loading...'
                : hasNextPage === true
                  ? 'Load More'
                  : 'No More Videos'}
            </LoadingButton>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}
