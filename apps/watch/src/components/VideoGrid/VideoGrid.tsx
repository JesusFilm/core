import AddRounded from '@mui/icons-material/AddRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/GridLegacy'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import type { ComponentProps, MouseEvent, ReactElement } from 'react'

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
  const { t } = useTranslation('apps-watch')

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
              onClick={onCardClick}
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
      {!loading && hasNoResults && (
        <Grid item xs={12} justifyContent="center" alignItems="center">
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              borderRadius: 4,
              width: '100%',
              padding: 8
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main'
              }}
            >
              {t('Sorry, no results')}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {t('Try removing or changing something from your request')}
            </Typography>
          </Paper>
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
