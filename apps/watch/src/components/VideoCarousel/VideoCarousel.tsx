import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ComponentProps, ReactElement, useMemo, useRef } from 'react'
import { A11y, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import {
  type VideoCarouselSlide,
  isMuxSlide,
  isVideoSlide,
  transformMuxSlide,
  transformVideoChild
} from '../../types/inserts'
import { VideoCard } from '../NewVideoContentPage/VideoCarousel/VideoCard'

import { NavButton } from './NavButton'

interface VideoCarouselProps {
  activeVideoId?: string
  videos?: VideoChildFields[]
  slides?: VideoCarouselSlide[]
  loading?: boolean
  containerSlug?: string
  onVideoSelect?: (videoId: string) => void
}

export function VideoCarousel({
  activeVideoId,
  loading,
  videos,
  slides,
  containerSlug,
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

  const computedSlides = useMemo<VideoCarouselSlide[]>(() => {
    if (slides != null) return slides
    return (
      videos?.map((video) => ({
        source: 'video' as const,
        id: video.id,
        video
      })) ?? []
    )
  }, [slides, videos])

  return (
    <Box sx={{ position: 'relative' }} data-testid="VideoCarousel">
      {loading === true && (
        <Swiper
          modules={[Navigation, A11y]}
          spaceBetween={12}
          slidesOffsetBefore={24}
          slidesOffsetAfter={24}
          breakpoints={swiperBreakpoints}
          onClick={() => false}
        >
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
          <SwiperSlide>
            <VideoCard variant={variant} />
          </SwiperSlide>
        </Swiper>
      )}
      {loading !== true && (
        <Swiper
          modules={[Navigation, A11y]}
          autoHeight
          speed={850}
          watchOverflow
          allowTouchMove
          spaceBetween={12}
          slidesOffsetBefore={24}
          slidesOffsetAfter={24}
          breakpoints={swiperBreakpoints}
          navigation={{
            nextEl: nextRef.current,
            prevEl: prevRef.current
          }}
        >
          {computedSlides.map((slide) => (
            <SwiperSlide
              key={
                isMuxSlide(slide)
                  ? `mux-${slide.id}-${slide.playbackIndex}`
                  : `video-${slide.id}`
              }
            >
              <VideoCard
                data={isMuxSlide(slide) ? transformMuxSlide(slide) : transformVideoChild(slide.video as VideoChildFields)}
                active={activeVideoId === slide.id}
                containerSlug={containerSlug}
                onVideoSelect={onVideoSelect}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <NavButton variant="prev" ref={prevRef} disabled={loading} />
      <NavButton variant="next" ref={nextRef} disabled={loading} />
    </Box>
  )
}
