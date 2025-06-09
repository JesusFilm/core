import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
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
    <Box data-testid="VideoCarousel" sx={{ my: 7 }}>
      <StyledSwiper
        data-testid="VideoCarouselSwiper"
        modules={[Mousewheel, FreeMode, A11y]}
        mousewheel={{
          forceToAxis: true
        }}
        observeParents
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        draggable
        watchOverflow
        spaceBetween={20}
        slidesOffsetBefore={28}
        slidesOffsetAfter={28}
      >
        {videos.length > 0
          ? videos?.map((video) => (
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
            ))
          : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <StyledSwiperSlide key={i} className="max-w-[200px]">
                <Skeleton
                  variant="rectangular"
                  width={200}
                  height={240}
                  sx={{
                    borderRadius: 3
                  }}
                />
              </StyledSwiperSlide>
            ))}
      </StyledSwiper>
    </Box>
  )
}
