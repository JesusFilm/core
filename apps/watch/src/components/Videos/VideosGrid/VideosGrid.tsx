import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { VideoGridCard } from './VideoGridCard'

interface VideosGridProps {
  videos?: VideoChildFields[]
  loading?: boolean
  isEnd?: boolean
  showLoadMore?: boolean
  onLoadMore?: () => Promise<void>
  routePrefix?: string
}

export function VideosGrid({
  videos,
  routePrefix
}: VideosGridProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
      <Container
        aria-label="videos-grid"
        disableGutters
        maxWidth="xxl"
        sx={{
          mb: 17,
          display: 'grid',
          gap: '10px 16px',
          gridTemplateColumns: {
            xs: 'auto',
            md: 'repeat(2, auto)',
            lg: 'repeat(4, auto)'
          }
        }}
      >
        {videos?.map((item, index) => (
          <VideoGridCard
            key={index}
            video={videos.find((video) => video.id === item.id)}
            routePrefix={routePrefix}
          />
        ))}
      </Container>
    </ThemeProvider>
  )
}
