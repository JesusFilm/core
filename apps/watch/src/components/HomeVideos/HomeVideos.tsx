import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'

import { GetHomeVideo_video } from '../../../__generated__/GetHomeVideo'
import { FilmType, HomeVideoCard } from './Card'

export interface HomeVideo {
  id: string
  designation: FilmType
}

interface VideoListGridProps {
  videos: HomeVideo[] | undefined
  data: GetHomeVideo_video[] | undefined
  loading?: boolean
}

export function HomeVideos({ data, videos }: VideoListGridProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
      <Grid
        container
        spacing="14px"
        data-testid="video-list-grid"
        justifyContent="center"
        mb={0}
        mr={0}
        pt={0}
        px="76px"
      >
        {(data?.length ?? 0) > 0 &&
          videos?.map((item, index) => (
            <Grid
              item
              key={index}
              pt={0}
              xl={3}
              lg={4}
              md={6}
              sm={12}
              xs={12}
              minWidth={266}
              maxWidth={338}
              minHeight={136}
              maxHeight={160}
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
              <HomeVideoCard
                video={data?.find((video) => video.id === item.id)}
                designation={item?.designation}
              />
            </Grid>
          ))}
      </Grid>
    </ThemeProvider>
  )
}
