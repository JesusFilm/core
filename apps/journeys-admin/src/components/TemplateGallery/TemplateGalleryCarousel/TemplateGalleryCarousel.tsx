import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import SwiperCore from 'swiper'
import { A11y, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'
import { NavigationOptions } from 'swiper/types/modules/navigation'

import { NavButton } from './NavButton'

import 'swiper/css'

SwiperCore.use([Navigation, Mousewheel, A11y])

const StyledSwiperContainer = styled(Swiper)(() => ({
  overflow: 'visible !important',
  marginTop: '16px',
  '.swiper-slide': {
    // Use important otherwise swiper overrides width on resize
    width: 'unset !important'
  }
}))

interface TemplateGalleryCarouselProps<T> {
  items: Array<T & { id: string }>
  renderItem: (itemProps: { item?: T }) => ReactNode
  heading?: string
  breakpoints: SwiperOptions['breakpoints']
  loading?: boolean
}

export function TemplateGalleryCarousel<T>({
  items,
  renderItem,
  heading,
  breakpoints,
  loading = false
}: TemplateGalleryCarouselProps<T>): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [hovered, setHovered] = useState(false)

  const nextRef = useRef<HTMLButtonElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (swiper != null) {
      const navigation = swiper.params.navigation as NavigationOptions
      navigation.nextEl = nextRef.current
      navigation.prevEl = prevRef.current

      swiper.navigation.destroy()
      swiper.navigation.init()
      swiper.navigation.update()
    }
  }, [swiper])

  return (
    <Box
      sx={{ position: 'relative' }}
      data-testid={`${
        heading?.replace(' ', '') ?? ''
      }-template-gallery-carousel`}
    >
      {heading != null && <Typography variant="h5">{heading}</Typography>}
      <StyledSwiperContainer
        freeMode
        speed={850}
        slidesPerView="auto"
        spaceBetween={20}
        watchOverflow
        allowTouchMove
        observer
        observeParents
        resizeObserver
        mousewheel={{ forceToAxis: true }}
        breakpoints={breakpoints}
        onSwiper={(swiper) => setSwiper(swiper)}
      >
        {loading
          ? [0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
              return (
                <SwiperSlide key={`${heading ?? ''}-item-${index}`}>
                  {renderItem({})}
                </SwiperSlide>
              )
            })
          : items.map((item) => {
              return (
                <SwiperSlide
                  key={item.id}
                  data-testid={`journey-${item.id}`}
                  onMouseOver={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  {renderItem({ item })}
                </SwiperSlide>
              )
            })}
      </StyledSwiperContainer>
      <NavButton
        variant="prev"
        ref={prevRef}
        hovered={hovered}
        disabled={loading || prevRef.current?.disabled}
      />
      <NavButton
        variant="next"
        ref={nextRef}
        hovered={hovered}
        disabled={loading || nextRef.current?.disabled}
      />
    </Box>
  )
}
