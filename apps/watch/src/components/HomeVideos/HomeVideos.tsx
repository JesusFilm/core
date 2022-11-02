import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { GetVideos_videos } from '../../../__generated__/GetVideos'
import { designationTypes, HomeVideoCard } from './Card/HomeVideoCard'

export interface HomeVideo {
  id: string
  designation: designationTypes
}

interface VideoListGridProps {
  videos: HomeVideo[] | undefined
  data: GetVideos_videos[] | undefined
  loading?: boolean
}

export function HomeVideos({
  loading = false,
  data,
  videos
}: VideoListGridProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.website} themeMode={ThemeMode.dark}>
      <Grid
        container
        spacing="14px"
        data-testid="video-list-grid"
        mb={0}
        mr={0}
        pt={0}
      >
        {(data?.length ?? 0) > 0 &&
          videos?.map((item, index) => (
            <Grid item key={index} md={6} sm={12} xs={12} lg={4} xl={3} pt={0}>
              <HomeVideoCard
                video={data?.find((video) => video.id === item.id)}
                designation={item?.designation}
              />
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
              data-testid="video-list-grid-placeholder"
              mr="16px"
            >
              <HomeVideoCard />
            </Grid>
          ))}
      </Grid>
    </ThemeProvider>
  )
}
