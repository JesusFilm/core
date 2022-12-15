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

// Remove when we can update to latest swiper version
type SwiperExtended = SwiperCore & {
  snapGrid: number[]
  snapIndex: number
  slidesGrid: number[]
  slidesSizesGrid: number[]
  virtualSize: number
}

export function VideosCarousel({
  videos,
  renderItem
}: VideosCarouselProps): ReactElement {
  const minPageMargin = 24

  const theme = useTheme()
  const [overflowSlides, setOverflowSlides] = useState(true)

  // Check if all slides fit on screen
  const updateShowHideNav = (swiper: SwiperExtended): void => {
    const slidesPerGroup = swiper.params.slidesPerGroup ?? 1

    if (swiper.slides.length > slidesPerGroup) {
      setOverflowSlides(true)
    } else {
      setOverflowSlides(false)
    }
  }

  // Left align if all slides fit on screen
  const updateSlidesAlignment = (swiper: SwiperExtended): void => {
    if (swiper.params.centeredSlides === true) {
      const slidesPerGroup = swiper.params.slidesPerGroup ?? 1

      if (swiper.slidesGrid.length <= slidesPerGroup) {
        swiper.params.centeredSlides = false
        swiper.params.centeredSlidesBounds = false
        swiper.params.centerInsufficientSlides = false
        swiper.update()
      }
    }
  }

  // Fix slides cut off at end
  const updateSnapGrid = (swiper: SwiperExtended): void => {
    const snapGrid = swiper.snapGrid
    const translateToEnd =
      swiper.slidesGrid[0] +
      swiper.slidesGrid[swiper.slidesGrid.length - 1] +
      minPageMargin

    // TODO: Perfectly align slides per group. Bugged where we cannot nav to beginning

    // Slide less far
    if (snapGrid[snapGrid.length - 1] > translateToEnd) {
      snapGrid[snapGrid.length - 1] = translateToEnd
    }
    // Slide further to end
    if (translateToEnd > snapGrid[snapGrid.length - 1]) {
      snapGrid.push(translateToEnd)
    }
  }

  // Smoothly show/hide left margin on carousel.
  // slidesOffsetBefore causes bug with centering slides
  // Update left margin on carousel initiation (onSwiper), onResize and onSlideChangeTransitionEnd()
  const updateMarginLeftOffset = (swiper: SwiperCore): void => {
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
      // TODO: Use wrapperClass after updating Swiper version. Currently not supported for swiper/react
      className="jfp-watch"
      data-testid="videos-carousel"
      {...mobileSlideConfig}
      breakpoints={{
        1200: { ...laptopSlideConfig, spaceBetween: 20 },
        1400: { ...desktopSlideConfig, spaceBetween: 12 },
        // Need config at each breakpoint as resizing causes issues
        // Hides gap between rightmost slide and right edge of screen
        1552: { ...desktopSlideConfig, spaceBetween: 22 },
        1600: {
          ...desktopSlideConfig,
          spaceBetween: 20
        },
        1800: { ...desktopSlideConfig, spaceBetween: 20 },
        2000: {
          ...desktopSlideConfig,
          slidesPerGroup: 7,
          spaceBetween: 20
        },
        2080: {
          ...desktopSlideConfig,
          slidesPerGroup: 7,
          spaceBetween: 22
        }
        // TODO: fix gap issue on extra-wide screens
      }}
      // TODO: Dynamic speed based on number of slides transformed
      speed={850}
      // Set custom navigation
      navigation={{
        nextEl: '.jfp-button-next',
        prevEl: '.jfp-button-prev'
      }}
      // Swiper disables navigation when few slides
      watchOverflow
      // Set spacing at carousel end.
      slidesOffsetAfter={minPageMargin}
      onSlideChangeTransitionEnd={(swiper: SwiperExtended) => {
        updateMarginLeftOffset(swiper)
        updateSlidesAlignment(swiper)
      }}
      // On resize and init, update spacing and nav features
      onResize={(swiper: SwiperExtended) => {
        updateMarginLeftOffset(swiper)
        updateSlidesAlignment(swiper)
        updateShowHideNav(swiper)
        updateSnapGrid(swiper)
      }}
      onSwiper={(swiper: SwiperExtended) => {
        updateMarginLeftOffset(swiper)
        updateSlidesAlignment(swiper)
        updateShowHideNav(swiper)
        updateSnapGrid(swiper)
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
          // transition: 'opacity 0.5s ease',
          opacity: { xs: 0, xl: overflowSlides ? 1 : 0 },
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
          },
          [theme.breakpoints.up(2000)]: {
            height: '115px'
          }
        }}
      >
        <VideosCarouselNavButton variant="prev" />
        <VideosCarouselNavButton variant="next" />
      </Stack>
    </Swiper>
  )
}
