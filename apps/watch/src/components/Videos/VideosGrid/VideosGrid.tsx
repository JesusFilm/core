import { ReactElement } from 'react'
import Container from '@mui/material/Container'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { GridItem } from './GridItem'

interface VideosGridProps {
  videos?: VideoChildFields[]
  loading?: boolean
  isEnd?: boolean
  showLoadMore?: boolean
  onLoadMore?: () => Promise<void>
  routePrefix?: string
  routeSuffix?: string
}

export function VideosGrid({
  videos,
  routePrefix,
  routeSuffix
}: VideosGridProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.light}>
      <Container
        aria-label="videos-grid"
        disableGutters
        maxWidth="xxl"
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'auto',
            md: 'repeat(2, auto)',
            lg: 'repeat(4, auto)'
          },
          columnGap: 3,
          rowGap: 2,
          pb: 10
        }}
      >
        {videos?.map((item, index) => (
          <GridItem
            key={index}
            video={videos.find((video) => video.id === item.id)}
            routePrefix={routePrefix}
            routeSuffix={routeSuffix}
          />
        ))}
      </Container>
    </ThemeProvider>
  )
}
