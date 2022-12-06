import { ReactElement } from 'react'
import Grid from '@mui/material/Grid'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { HomeVideoCard } from './Card'

interface VideoListGridProps {
  data: VideoChildFields[] | undefined
  loading?: boolean
}

export function HomeVideos({ data }: VideoListGridProps): ReactElement {
  return (
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
        data?.map((item, index) => (
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
            />
          </Grid>
        ))}
    </Grid>
  )
}
