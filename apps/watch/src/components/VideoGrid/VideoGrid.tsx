import AddRounded from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/GridLegacy'
import type { ComponentProps, MouseEvent, ReactElement } from 'react'

import { EmptySearch } from '@core/journeys/ui/EmptySearch'

import type { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

export interface VideoGridProps {
  videos?: VideoChildFields[]
  showLoadMore?: boolean
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
  loading?: boolean
  showMore?: () => void
  hasNextPage?: boolean
  hasNoResults?: boolean
  onCardClick?: (videoId?: string) => (event: MouseEvent) => void
}

export function VideoGrid({
  videos = [],
  showLoadMore = false,
  containerSlug,
  variant = 'expanded',
  loading = false,
  showMore,
  hasNextPage = true,
  hasNoResults = false,
  onCardClick
}: VideoGridProps): ReactElement {
  return (
    <Grid
      container
      spacing={4}
      rowSpacing={variant === 'expanded' ? 8 : 4}
      data-testid="VideoGrid"
    >
      {(videos?.length ?? 0) > 0 &&
        videos?.map((video, index) => (
          <Grid item key={index} xs={12} md={6} xl={4}>
            <VideoCard
              video={video}
              containerSlug={containerSlug}
              variant={variant}
              onClick={onCardClick}
            />
          </Grid>
        ))}
      {loading && videos?.length === 0 && (
        <>
          <Grid item xs={12} md={6} xl={4}>
            <VideoCard variant={variant} />
          </Grid>
          <Grid item xs={12} md={6} xl={4}>
            <VideoCard variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            xl={4}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <VideoCard variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={6}
            xl={4}
            sx={{ display: { xs: 'none', xl: 'block' } }}
          >
            <VideoCard variant={variant} />
          </Grid>
        </>
      )}
      {!loading && hasNoResults && (
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <EmptySearch />
        </Grid>
      )}
      {showLoadMore && !hasNoResults && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <Button
              variant="outlined"
              onClick={showMore}
              loading={loading}
              startIcon={<AddRounded />}
              disabled={!hasNextPage}
              loadingPosition="start"
              size="medium"
            >
              {loading
                ? 'Loading...'
                : hasNextPage
                  ? 'Load More'
                  : 'No More Videos'}
            </Button>
          </Box>
        </Grid>
      )}
    </Grid>
  )
}
