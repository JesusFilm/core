import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { ComponentProps, ReactElement, useRef } from 'react'
import { A11y, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'

import { NavButton } from './NavButton'

interface VideoCarouselProps {
  activeVideoId?: string
  videos?: VideoChildFields[]
  loading?: boolean
  containerSlug?: string
  variant?: ComponentProps<typeof VideoCard>['variant']
}

export function VideoCarousel({
  activeVideoId,
  loading,
  videos,
  containerSlug,
  variant = 'expanded'
}: VideoCarouselProps): ReactElement {
  const { breakpoints } = useTheme()
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)
  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 1,
      slidesPerView: 1.4
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 2,
      slidesPerView: 2.4
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 3,
      slidesPerView: 3.4
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 3,
      slidesPerView: 3.4
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 4,
      slidesPerView: 4.4
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 4,
      slidesPerView: 4.4
    }
  }

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
          {videos?.map((video) => (
            <SwiperSlide key={video.id}>
              <VideoCard
                video={video}
                containerSlug={containerSlug}
                variant={variant}
                active={activeVideoId === video.id}
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
