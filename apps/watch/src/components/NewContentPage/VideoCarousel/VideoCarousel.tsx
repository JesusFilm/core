import { styled } from '@mui/material/styles'
import { ReactElement } from 'react'
import { A11y, FreeMode, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'

import { VideoCard } from './VideoCard'

const StyledSwiper = styled(Swiper)(() => ({}))
const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

interface VideoCarouselProps {
  videos: VideoChildFields[]
  containerSlug?: string
  activeVideoId?: string
}

export function VideoCarousel({
  videos,
  containerSlug,
  activeVideoId
}: VideoCarouselProps): ReactElement {
  return (
    <div data-testid="VideoCarousel">
      <StyledSwiper
        modules={[Mousewheel, FreeMode, A11y]}
        mousewheel={{
          forceToAxis: true
        }}
        observeParents
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        spaceBetween={20}
        draggable
        watchOverflow
        data-testid="VideoCarouselSwiper"
        sx={{
          display: 'flex',
          gap: 2,
          pl: 10,
          pr: 4
        }}
      >
        {videos?.map((video) => (
          <StyledSwiperSlide
            key={video.id}
            className="max-w-[200px]"
            data-testid={`CarouselSlide-${video.id}`}
            sx={{
              maxWidth: '200px'
            }}
          >
            <VideoCard
              key={video.id}
              containerSlug={containerSlug}
              video={video}
              active={activeVideoId === video.id}
            />
          </StyledSwiperSlide>
        ))}
      </StyledSwiper>
    </div>
  )
}
