import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName, ThemeMode } from '@core/shared/ui/themes'
import { GetHomeVideos_videos } from '../../../__generated__/GetHomeVideos'
import { designationTypes, HomeVideoCard } from './Card/HomeVideoCard'

export interface HomeVideo {
  id: string
  designation: designationTypes
}

interface VideoListGridProps {
  videos: HomeVideo[] | undefined
  data: GetHomeVideos_videos[] | undefined
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
        columns={{ xs: 12, sm: 12, md: 6, lg: 4, xl: 3 }}
      >
        {(data?.length ?? 0) > 0 &&
          videos?.map((item, index) => (
            <Grid
              item
              key={index}
              pt={0}
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
