import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { ComponentProps, ReactElement } from 'react'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

interface VideoGridProps {
  videos?: VideoChildFields[]
  loading?: boolean
  hasNextPage?: boolean
  onLoadMore?: () => Promise<void>
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
  languageId: string
}

export function VideoGrid({
  loading,
  hasNextPage,
  onLoadMore,
  videos,
  containerSlug,
  variant = 'expanded',
  languageId
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
          <Grid item key={index} xs={12} md={4} xl={3}>
            <VideoCard
              video={video}
              containerSlug={containerSlug}
              variant={variant}
              languageId={languageId}
            />
          </Grid>
        ))}
      {loading === true && (
        <>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard languageId={languageId} variant={variant} />
          </Grid>
          <Grid item xs={12} md={4} xl={3}>
            <VideoCard languageId={languageId} variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            xl={3}
            sx={{ display: { xs: 'none', md: 'block' } }}
          >
            <VideoCard languageId={languageId} variant={variant} />
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            xl={3}
            sx={{ display: { xs: 'none', xl: 'block' } }}
          >
            <VideoCard languageId={languageId} variant={variant} />
          </Grid>
        </>
      )}
      {onLoadMore != null && (
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <LoadingButton
              variant="outlined"
              onClick={onLoadMore as () => void}
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
