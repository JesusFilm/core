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
    backgroundColor: 'rgba(19, 17, 17, 0.25)',
    '&:hover': {
      backgroundColor: 'rgba(19, 17, 17, 0.50)'
    },
    '&.swiper-button-disabled': {
      display: 'none'
    }
  }

  return (
    <Swiper
      data-testid="videos-carousel"
      // Show multiple slides with gaps between
      spaceBetween={20}
      slidesPerView="auto"
      // Set custom navigation
      navigation={{
        nextEl: '.jfp-button-next',
        prevEl: '.jfp-button-prev'
      }}
      // Update swiper left/right margins
      updateOnWindowResize
      onResize={(swiper) => {
        setMarginOffset(calculateMarginOffset(theme.breakpoints.values.xxl))
        // Set touch move on resize
        swiper.allowTouchMove = window.innerWidth < theme.breakpoints.values.xl
      }}
      slidesOffsetBefore={marginOffset}
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
