import { gql, useQuery } from '@apollo/client'
import {
  Card,
  CardContent,
  CardMedia,
  LinearProgress,
  Typography
} from '@mui/material'
import { ReactElement, useState } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'
import { secondsToTimeFormat } from '@core/shared/ui'

import {
  GetVideos,
  GetVideos_videos
} from '../../../../__generated__/GetVideos'

export const GET_VIDEOS = gql`
  query GetVideos($where: VideosFilter, $page: Int, $limit: Int) {
    videos(where: $where, page: $page, limit: $limit) {
      id
      image
      snippet {
        primary
        value
      }
      title {
        primary
        value
      }
      variant {
        duration
      }
    }
  }
`
const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 15000, min: 1200 },
    items: 4
  },
  desktop: {
    breakpoint: { max: 1200, min: 800 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 800, min: 400 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 400, min: 0 },
    items: 1
  }
}

const limit = 8

export function VideoList(): ReactElement {
  const [isMoving, setIsMoving] = useState(false)
  const [page, setPage] = useState(1)
  const [videos, setVideos] = useState<GetVideos_videos[]>([])
  const { data, loading, refetch } = useQuery<GetVideos>(GET_VIDEOS, {
    variables: {
      where: {
        availableVariantLanguageIds: ['529']
      },
      page: page,
      limit: limit
    },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setVideos([...videos, ...data.videos])
    }
  })

  return (
    <Carousel
      responsive={responsive}
      autoPlay={false}
      beforeChange={async (nextSlide, state) => {
        setIsMoving(true)
        if (nextSlide > videos.length - 7) {
          setPage(page + 1)
          await refetch()
          if (data != null) {
            await setVideos([...videos, ...data.videos])
            state.totalItems += data.videos.length
          }
        }
      }}
      afterChange={async (nextSlide, state) => {
        state.totalItems = videos.length
        setIsMoving(false)
      }}
      shouldResetAutoplay={false}
    >
      {(videos.length ?? 0) > 0 &&
        videos.map((video, index) => (
          <Card key={index} sx={{ width: 300, height: 315, my: 5, mx: 20 }}>
            <CardMedia component="img" image={video.image ?? ''} height="140" />
            <CardContent>
              <Typography variant="subtitle2">
                {video.title[0].value}
              </Typography>
              <Typography variant="caption">
                {secondsToTimeFormat(video.variant?.duration ?? 0)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      {loading &&
        [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <Card key={index} sx={{ width: 300, height: 315, my: 5, mx: 20 }}>
            <CardMedia
              component="img"
              image="/loading-blurhash.png"
              height="140"
            />
            <CardContent>
              <LinearProgress />
            </CardContent>
          </Card>
        ))}
    </Carousel>
  )
}
