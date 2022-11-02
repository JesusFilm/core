import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { deepmerge } from '@mui/utils'
import { GetVideos_videos } from '../../../__generated__/GetVideos'
import { darkTheme } from '../ThemeProvider/ThemeProvider'
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

export function HomeVideoList({
  loading = false,
  data,
  videos
}: VideoListGridProps): ReactElement {
  const gridTheme = createTheme(
    deepmerge(darkTheme, {
      breakpoints: {
        values: {
          xs: 0,
          sm: 725,
          md: 1043,
          lg: 1600,
          xl: 1600
        }
      }
    })
  )
  return (
    <ThemeProvider theme={gridTheme}>
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
