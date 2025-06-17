import Skeleton from '@mui/material/Skeleton'
import { ReactElement, useRef } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { NavButton } from '../../VideoCarousel/NavButton/NavButton'

import { VideoCard } from './VideoCard'

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
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)
  return (
    <div data-testid="VideoCarousel" className="my-7 relative">
      <Swiper
        data-testid="VideoCarouselSwiper"
        modules={[Mousewheel, FreeMode, A11y, Navigation]}
        mousewheel={{
          forceToAxis: true
        }}
        grabCursor
        observeParents
        slidesPerView={'auto'}
        pagination={{ clickable: true }}
        draggable
        watchOverflow
        spaceBetween={20}
        slidesOffsetBefore={28}
        slidesOffsetAfter={28}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
      >
        {videos.length > 0
          ? videos?.map((video) => (
              <SwiperSlide
                key={video.id}
                className="max-w-[200px]"
                data-testid={`CarouselSlide-${video.id}`}
              >
                <VideoCard
                  key={video.id}
                  containerSlug={containerSlug}
                  video={video}
                  active={activeVideoId === video.id}
                />
              </SwiperSlide>
            ))
          : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <SwiperSlide key={i} className="max-w-[200px]">
                <Skeleton
                  variant="rectangular"
                  width={200}
                  height={240}
                  sx={{
                    borderRadius: 3
                  }}
                />
              </SwiperSlide>
            ))}
      </Swiper>
      <NavButton variant="prev" ref={prevRef} />
      <NavButton variant="next" ref={nextRef} />
    </div>
  )
}
