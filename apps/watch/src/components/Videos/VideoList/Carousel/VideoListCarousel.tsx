import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import { GetVideos_videos } from '../../../../../__generated__/GetVideos'
import { VideoListCard } from '../Card/VideoListCard'

interface VideoListCarouselProps {
  videos: GetVideos_videos[]
  loading?: boolean
  onLoadMore: () => Promise<void>
}

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

export function VideoListCarousel({
  loading = false,
  onLoadMore,
  videos
}: VideoListCarouselProps): ReactElement {
  const [isMoving, setIsMoving] = useState(false)
  return (
    <Box data-testid="video-list-carousel">
      <Carousel
        responsive={responsive}
        autoPlay={false}
        beforeChange={async (nextSlide, state) => {
          setIsMoving(true)
          if (nextSlide > videos.length - 7) {
            await onLoadMore()
            state.totalItems = videos.length
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
            <VideoListCard video={video} key={index} disabled={isMoving} />
          ))}
        {loading &&
          [1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
            <VideoListCard key={index} />
          ))}
      </Carousel>
    </Box>
  )
}
