import { ReactElement, ReactNode, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Navigation, A11y } from 'swiper'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'

import { VideoChildFields } from '../../../__generated__/VideoChildFields'
import { VideosCarouselNavButton } from './VideosCarouselNavButton/VideosCarouselNavButton'

type auto = 'auto'

interface VideosCarouselProps {
  videos: VideoChildFields[]
  renderItem: (props: unknown) => ReactNode
}

SwiperCore.use([Navigation, A11y])

export function VideosCarousel({
  videos,
  renderItem
}: VideosCarouselProps): ReactElement {
  const minPageMargin = 24

  const theme = useTheme()
  const [overflowSlides, setOverflowSlides] = useState(true)
  const [marginOffset, setMarginOffset] = useState(minPageMargin)

  // Page margin
  const getMarginOffset = (): number => {
    const maxContentWidth = theme.breakpoints.values.xxl

    if (window != null) {
      return window.innerWidth <= maxContentWidth
        ? minPageMargin
        : (window.innerWidth - maxContentWidth) / 2 + minPageMargin
    }
    return minPageMargin
  }

  // Smoothly show/hide left margin on carousel.
  // slidesOffsetBefore causes bug with centering slides
  // Update left margin on carousel initiation (onSwiper), onResize and onSlideChangeTransitionEnd()
  const updateMarginLeftOffset = (swiper: SwiperCore): void => {
    swiper.wrapperEl.style.transition = '0.2s all ease-out'
    if (swiper.isBeginning) {
      swiper.wrapperEl.style.paddingLeft = '24px'
    } else {
      swiper.wrapperEl.style.paddingLeft = '0px'
    }
  }

  // Mobile slides scroll continuously
  const mobileSlideConfig = {
    // Set to auto so we can use fixed height carousel items.
    // If slidesPerView to a number, we get a navigation overlay height bug since nav height cannot be calculated dynamically whilst resizing.
    slidesPerView: 'auto' as auto,
    slidesPerGroup: 1,
    spaceBetween: 12,
    centeredSlides: false,
    centeredSlidesBounds: false,
    centerInsufficientSlides: false,
    allowTouchMove: true
  }

  // Laptop and desktop slides scroll by group size
  const laptopSlideConfig = {
    slidesPerView: 'auto' as auto,
    slidesPerGroup: 3,
    centeredSlides: true,
    centeredSlidesBounds: true,
    centerInsufficientSlides: true,
    allowTouchMove: false
  }

  const desktopSlideConfig = {
    ...laptopSlideConfig,
    slidesPerGroup: 5
  }

  return (
    <Swiper
      data-testid="videos-carousel"
      {...mobileSlideConfig}
      breakpoints={{
        1200: { ...laptopSlideConfig, spaceBetween: 20 },
        1400: { ...desktopSlideConfig, spaceBetween: 12 },
        // Need config at each breakpoint as resizing causes issues
        // Hides gap between rightmost slide and right edge of screen
        1552: { ...desktopSlideConfig, spaceBetween: 16 },
        1800: { ...desktopSlideConfig, spaceBetween: 20 }
      }}
      // Set custom navigation
      navigation={{
        nextEl: '.jfp-button-next',
        prevEl: '.jfp-button-prev'
      }}
      // Swiper disables navigation when few slides
      watchOverflow
      // Set spacing at carousel end.
      slidesOffsetAfter={24}
      // Set spacing at carousel start
      onSlideChangeTransitionEnd={(swiper) => {
        updateMarginLeftOffset(swiper)
      }}
      onResize={(swiper) => {
        console.log('resize', swiper)
        updateMarginLeftOffset(swiper)
      }}
      onSwiper={(swiper) => {
        console.log('onSwiper', swiper)
        updateMarginLeftOffset(swiper)
        // TODO: Fix bug where end is not detected properly.

        // Extract swiper navigation overflow state to hide custom nav
        if (!swiper.allowSlideNext && !swiper.allowSlidePrev) {
          setOverflowSlides(false)
          console.log('hide nav')
        }
      }}
    >
      {/* Slides */}
      {videos.map((video, index) => (
        <SwiperSlide key={index} style={{ transition: '.35s all ease' }}>
          {renderItem({ ...video })}
        </SwiperSlide>
      ))}
      {/* Navigation overlay */}
      <Stack
        direction="row"
        sx={{
          display: { xs: 'none', xl: overflowSlides ? 'flex' : 'none' },
          position: 'absolute',
          zIndex: 1,
          top: 0,
          width: '100%',
          // Prefer fixed heights over using callbacks to retrieve dynamic carousel item image height.
          height: {
            xl: '152.5px',
            xxl: '113.5px'
          },
          [theme.breakpoints.up(1600)]: {
            height: '131.5px'
          },
          [theme.breakpoints.up(1800)]: {
            height: '147.5px'
          }
        }}
      >
        <VideosCarouselNavButton variant="prev" />
        <VideosCarouselNavButton variant="next" />
      </Stack>
    </Swiper>
  )
}
