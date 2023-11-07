import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import SwiperCore, { A11y, Mousewheel, Navigation, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { NavigationOptions } from 'swiper/types/components/navigation'

import { NavButton } from './NavButton'

import 'swiper/swiper.min.css'

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
  loading
}: TemplateGalleryCarouselProps<T>): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [showNav, setShowNav] = useState(false)

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
    <Box sx={{ position: 'relative' }}>
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
        {loading === true
          ? [0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <SwiperSlide key={`${heading ?? ''}-item-${index}`}>
                {renderItem({})}
              </SwiperSlide>
            ))
          : items.map((item) => (
              <SwiperSlide
                key={item.id}
                data-testid={`journey-${item.id}`}
                onMouseOver={() => setShowNav(true)}
                onMouseLeave={() => setShowNav(false)}
              >
                {renderItem({ item })}
              </SwiperSlide>
            ))}
      </StyledSwiperContainer>
      {loading !== true && (
        <>
          <NavButton variant="prev" ref={prevRef} show={showNav} />
          <NavButton variant="next" ref={nextRef} show={showNav} />
        </>
      )}
    </Box>
  )
}
