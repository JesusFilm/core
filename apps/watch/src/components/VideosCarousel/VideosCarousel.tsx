import { ReactElement, ReactNode, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Navigation, A11y } from 'swiper'
import Stack from '@mui/material/Stack'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import { useTheme } from '@mui/material/styles'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'

interface VideosCarouselProps {
  videos: VideoChildFields[]
  renderItem: (props: unknown) => ReactNode
}

SwiperCore.use([Navigation, A11y])

export function VideosCarousel({
  videos,
  renderItem
}: VideosCarouselProps): ReactElement {
  const theme = useTheme()
  const [overflowSlides, setOverflowSlides] = useState(true)
  const [marginOffset, setMarginOffset] = useState(24)

  const calculateMarginOffset = (maxWidth: number): number => {
    return window.innerWidth <= maxWidth
      ? 24
      : (window.innerWidth - maxWidth) / 2 + 24
  }

  const navigationStyles = {
    display: { xs: 'none', xl: overflowSlides ? 'flex' : 'none' },
    width: 56,
    height: '100%',
    color: 'primary.contrastText',
    background:
      'linear-gradient(90deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)',
    '&.swiper-button-disabled': {
      display: 'none'
    }
  }

  return (
    <Swiper
      data-testid="videos-carousel"
      // Show multiple slides with gaps between
      spaceBetween={16}
      slidesPerView="auto"
      slidesPerGroup={3}
      breakpoints={{
        1454: {
          spaceBetween: 20,
          slidesPerGroup: 3,
          slidesPerView: 3.92
        },
        1620: {
          spaceBetween: 20,
          slidesPerGroup: 4,
          slidesPerView: 4.2
        },
        1680: {
          slidesPerView: 'auto'
        },
        2242: {
          spaceBetween: 20,
          slidesPerGroup: 4,
          slidesPerView: 4.92
        },
        2312: {
          spaceBetween: 20,
          slidesPerGroup: 5,
          slidesPerView: 5.2
        },
        2370: {
          slidesPerView: 'auto'
        },
        2928: {
          spaceBetween: 20,
          slidesPerGroup: 5,
          slidesPerView: 5.92
        },
        3008: {
          spaceBetween: 20,
          slidesPerGroup: 6,
          slidesPerView: 6.2
        },
        3070: {
          spaceBetween: 20,
          slidesPerGroup: 6,
          slidesPerView: 'auto'
        }
      }}
      // Set custom navigation
      navigation={{
        nextEl: '.jfp-button-next',
        prevEl: '.jfp-button-prev'
      }}
      // Update swiper left/right margins
      updateOnWindowResize
      onResize={(swiper) => {
        setMarginOffset(calculateMarginOffset(theme.breakpoints.values.xxl))
        // Fix slide width after resize
        swiper.updateSlides()
        // Set touch move on resize
        swiper.allowTouchMove = window.innerWidth < theme.breakpoints.values.xl
      }}
      // slidesOffsetBefore={marginOffset}
      style={{ marginLeft: marginOffset }}
      slidesOffsetAfter={marginOffset}
      // Swiper disables navigation when few slides
      watchOverflow
      onSwiper={(swiper) => {
        console.log('onSwiper', swiper)
        // Set swiper left/right margins on init
        setMarginOffset(calculateMarginOffset(theme.breakpoints.values.xxl))
        // Set touch move on init
        swiper.allowTouchMove = window.innerWidth < theme.breakpoints.values.xl
        // Use swiper navigation checks to hide nav
        if (!swiper.allowSlideNext && !swiper.allowSlidePrev) {
          setOverflowSlides(false)
        }
      }}
    >
      {/* Slides */}
      {videos.map((video, index) => (
        <SwiperSlide key={index} style={{ width: 'auto' }}>
          {renderItem({ ...video })}
        </SwiperSlide>
      ))}
      {/* Navigation overlay */}
      <Stack
        direction="row"
        sx={{
          position: 'absolute',
          zIndex: 1,
          top: 0,
          width: '100%',
          height: '160px'
        }}
      >
        <Stack
          alignSelf="flex-start"
          justifyContent="center"
          alignItems="center"
          className="jfp-button-prev"
          onClick={(e) => e.preventDefault()}
          sx={navigationStyles}
        >
          <NavigateBeforeIcon fontSize="large" />
        </Stack>
        <Stack
          alignSelf="flex-end"
          justifyContent="center"
          alignItems="center"
          className="jfp-button-next"
          onClick={(e) => e.preventDefault()}
          sx={{
            ...navigationStyles,
            background:
              'linear-gradient(270deg, rgba(3, 3, 3, 0.85) 0%, rgba(3, 3, 3, 0.4) 50%, rgba(3, 3, 3, 0.1) 80%, rgba(3, 3, 3, 0.04) 90%, rgba(3, 3, 3, 0.02) 95%, rgba(3, 3, 3, 0.01) 100%)',
            position: 'absolute',
            right: 0
          }}
        >
          <NavigateNextIcon fontSize="large" />
        </Stack>
      </Stack>
    </Swiper>
  )
}
