import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import AddRounded from '@mui/icons-material/AddRounded'
import LoadingButton from '@mui/lab/LoadingButton'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import { getTheme, ThemeMode, ThemeName } from '@core/shared/ui/themes'
import { VideoCard } from '../Video'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'

interface VideosGridProps {
  videos: VideoChildFields[]
  loading?: boolean
  isEnd?: boolean
  showLoadMore?: boolean
  onLoadMore: () => Promise<void>
}

export function VideosGrid({
  loading = false,
  isEnd = false,
  onLoadMore,
  showLoadMore = true,
  videos
}: VideosGridProps): ReactElement {
  const gridTheme = createTheme(
    deepmerge(
      getTheme({ themeName: ThemeName.website, themeMode: ThemeMode.light }),
      {
        breakpoints: {
          values: {
            xs: 0,
            sm: 725,
            md: 1043,
            lg: 1450,
            xl: 1765
          }
        }
      }
    )
  )
  return (
    <ThemeProvider theme={gridTheme}>
      <Grid container spacing={4} data-testid="videos-grid">
        {(videos.length ?? 0) > 0 &&
          videos.map((video, index) => (
            <Grid item key={index} md={4} sm={6} xs={12} lg={3}>
              <VideoCard video={video} />
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
              mr="16px"
            >
              <VideoCard />
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
    </ThemeProvider>
  )
}
