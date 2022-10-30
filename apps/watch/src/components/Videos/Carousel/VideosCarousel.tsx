import Box from '@mui/material/Box'
import { ReactElement, useState } from 'react'
import Carousel from 'react-multi-carousel'
import 'react-multi-carousel/lib/styles.css'

import { GetVideos_videos } from '../../../../__generated__/GetVideos'
import { VideoCard } from '../../Video'

interface VideosCarouselProps {
  videos: GetVideos_videos[]
  loading?: boolean
  routePrefix?: string | undefined
  onLoadMore?: () => Promise<void> | undefined
}

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 15000, min: 1450 },
    items: 4
  },
  desktop: {
    breakpoint: { max: 1450, min: 1040 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1040, min: 725 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 400, min: 0 },
    items: 1
  }
}

export function VideosCarousel({
  loading = false,
  onLoadMore,
  videos,
  routePrefix = undefined
}: VideosCarouselProps): ReactElement {
  const [isMoving, setIsMoving] = useState(false)
  return (
    <Box data-testid="video-carousel">
      <Carousel
        responsive={responsive}
        autoPlay={false}
        removeArrowOnDeviceType={['tablet', 'mobile']}
        partialVisible
        itemClass="carousel-item"
        beforeChange={async (nextSlide, state) => {
          setIsMoving(true)
          if (nextSlide > videos.length - 7) {
            if (onLoadMore !== undefined) await onLoadMore()
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
            <VideoCard
              video={video}
              key={index}
              disabled={isMoving}
              routePrefix={routePrefix}
            />
          ))}
        {loading &&
          [1, 2, 3, 4, 5, 6, 7, 8].map((index) => <VideoCard key={index} />)}
      </Carousel>
    </Box>
  )
}
