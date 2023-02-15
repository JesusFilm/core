import Box from '@mui/material/Box'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { ComponentProps, ReactElement, useRef } from 'react'
import SwiperCore, { Navigation, A11y } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideoCard } from '../VideoCard'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation, A11y])

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
  const smUp = useMediaQuery(breakpoints.up('sm'))
  const mdUp = useMediaQuery(breakpoints.up('md'))
  const lgUp = useMediaQuery(breakpoints.up('lg'))
  const xlUp = useMediaQuery(breakpoints.up('xl'))
  const xxlUp = useMediaQuery(breakpoints.up('xxl'))
  const nextRef = useRef<HTMLDivElement>(null)
  const prevRef = useRef<HTMLDivElement>(null)

  return (
    <Box sx={{ position: 'relative' }}>
      <Swiper
        autoHeight
        speed={850}
        watchOverflow
        allowTouchMove
        spaceBetween={12}
        slidesOffsetBefore={24}
        slidesOffsetAfter={24}
        breakpoints={{
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
        }}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
      >
        {loading === true && (
          <>
            <SwiperSlide>
              <VideoCard variant={variant} />
            </SwiperSlide>
            <SwiperSlide>
              <VideoCard variant={variant} />
            </SwiperSlide>
            {smUp && (
              <SwiperSlide>
                <VideoCard variant={variant} />
              </SwiperSlide>
            )}
            {mdUp && (
              <SwiperSlide>
                <VideoCard variant={variant} />
              </SwiperSlide>
            )}
            {lgUp && (
              <SwiperSlide>
                <VideoCard variant={variant} />
              </SwiperSlide>
            )}
            {xlUp && (
              <SwiperSlide>
                <VideoCard variant={variant} />
              </SwiperSlide>
            )}
            {xxlUp && (
              <SwiperSlide>
                <VideoCard variant={variant} />
              </SwiperSlide>
            )}
          </>
        )}
        {loading !== true &&
          videos?.map((video) => (
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
      <NavButton variant="prev" ref={prevRef} />
      <NavButton variant="next" ref={nextRef} />
    </Box>
  )
}
