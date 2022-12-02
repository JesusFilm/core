import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { GetHomeVideo_video } from '../../../../__generated__/GetHomeVideo'
import { FilmType } from '../../Video'
import { GridItem } from './GridItem'

interface VideosGridProps {
  videos: Videos[]
  data: GetHomeVideo_video[] | undefined
  onLoadMore?: () => void
  showLoadMore?: boolean
  loading?: boolean
  isEnd?: boolean
}
export interface Videos {
  id: string
  designation?: FilmType
}

export function VideosGrid({ data, videos }: VideosGridProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
      <Grid container data-testid="video-list-grid" justifyContent="center">
        {videos.map((item, index) => (
          <Grid
            item
            mx={2}
            my="6px"
            key={index}
            // minWidth={266}
            // maxWidth={338}
            // minHeight={136}
            // maxHeight={160}
            sx={{
              display: {
                xs: index > 5 ? 'none' : '',
                sm: index > 5 ? 'none' : '',
                md: 'inherit',
                lg: 'inherit',
                xl: 'inherit'
              }
            }}
          >
            <GridItem video={data?.find((video) => video.id === item.id)} />
            {/* <VideoCard
                video={data?.find((video) => video.id === item.id)}
                designation={item?.designation}
              /> */}
          </Grid>
        ))}
      </Grid>
    </ThemeProvider>
  )
}
