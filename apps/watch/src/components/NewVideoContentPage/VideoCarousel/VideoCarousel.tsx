import { ReactElement, useRef } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { Skeleton } from '../../Skeleton'
import { NavButton } from '../../VideoCarousel/NavButton/NavButton'

import { VideoCard } from './VideoCard'

interface VideoCarouselProps {
  videos: VideoChildFields[]
  containerSlug?: string
  activeVideoId?: string
  loading?: boolean
}

export function VideoCarousel({
  videos,
  containerSlug,
  activeVideoId,
  loading = false
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
        slidesOffsetBefore={0}
        slidesOffsetAfter={0}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
      >
        {!loading
          ? videos.map((video, index) => (
              <SwiperSlide
                key={video.id}
                className={`max-w-[200px] ${index === 0 ? 'padded-l' : ''} ${index === videos.length - 1 ? 'padded-r' : ''}`}
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
                <Skeleton width={200} height={240} />
              </SwiperSlide>
            ))}
      </Swiper>
      <NavButton variant="prev" ref={prevRef} />
      <NavButton variant="next" ref={nextRef} />
    </div>
  )
}
