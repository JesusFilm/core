import { useTheme } from '@mui/material/styles'
import { ReactElement, useRef } from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { VideoChildFields } from '../../../../__generated__/VideoChildFields'
import { Skeleton } from '../../Skeleton'
import { NavButton } from '../../VideoCarousel/NavButton/NavButton'

import { VideoCard } from './VideoCard'

interface VideoCarouselProps {
  videos: VideoChildFields[]
  containerSlug?: string
  activeVideoId?: string
  loading?: boolean
  onVideoSelect?: (videoId: string) => void
}

export function VideoCarousel({
  videos,
  containerSlug,
  activeVideoId,
  loading = false,
  onVideoSelect
}: VideoCarouselProps): ReactElement {
  const { breakpoints } = useTheme()
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      slidesPerView: 2.4
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      slidesPerView: 3.4
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      slidesPerView: 4.4
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      slidesPerView: 5.4
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      slidesPerView: 6.4
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      slidesPerView: 7.4
    }
  }

  return (
    <div data-testid="VideoCarousel" className="relative">
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
        // slidesOffsetBefore={28}
        slidesOffsetAfter={28}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
        breakpoints={swiperBreakpoints}
      >
        {!loading
          ? videos.map((video, index) => (
              <SwiperSlide
                key={video.id}
                className={`max-w-[200px] ${index === 0 ? 'padded-l' : ''}`}
                data-testid={`CarouselSlide-${video.id}`}
              >
                <VideoCard
                  key={video.id}
                  containerSlug={containerSlug}
                  video={video}
                  active={activeVideoId === video.id}
                  onVideoSelect={onVideoSelect}
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
