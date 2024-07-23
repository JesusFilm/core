import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { ComponentProps, ReactElement } from 'react'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { useAlgoliaVideos } from '../../libs/algolia/useAlgoliaVideos'
import { VideoCard } from '../VideoCard'

interface VideoGridProps {
  loading?: boolean
  hasNextPage?: boolean
  showLoadMore?: boolean
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
}

export function VideoGrid({
  loading,
  showLoadMore = false,
  containerSlug,
  variant = 'expanded'
}: VideoGridProps): ReactElement {
  const { hits: videos, showMore, isLastPage } = useAlgoliaVideos()

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
              video={video as unknown as VideoChildFields}
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
      {showLoadMore && (
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
              {loading === true
                ? 'Loading...'
                : isLastPage !== true
                  ? 'Load More'
                  : 'No More Videos'}
            </LoadingButton>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}
