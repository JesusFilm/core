import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import type { ComponentProps, ReactElement } from 'react'

import { EmptySearch } from '@core/journeys/ui/EmptySearch'

import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import { VideoCard } from '../VideoCard'


interface VideoGridProps {
  videos?: VideoChildFields[]
  showLoadMore?: boolean
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
}

export function VideoGrid({
  videos: coreVideos,
  showLoadMore = false,
  containerSlug,
  variant = 'expanded'
}: VideoGridProps): ReactElement {
  const {
    hits: algoliaVideos,
    showMore,
    isLastPage,
    loading,
    noResults
  } = useAlgoliaVideos()
  const videos = coreVideos != null ? coreVideos : algoliaVideos
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
      {loading && videos?.length === 0 && (
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
      {!loading && noResults && (
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <EmptySearch />
        </Grid>
      )}
      {showLoadMore && videos.length > 0 && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <LoadingButton
              variant="outlined"
              onClick={showMore}
              loading={loading}
              startIcon={<AddRounded />}
              disabled={isLastPage}
              loadingPosition="start"
              size="medium"
            >
              {loading
                ? 'Loading...'
                : !isLastPage
                  ? 'Load More'
                  : 'No More Videos'}
            </LoadingButton>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}
