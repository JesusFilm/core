import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'
import SwiperCore, { A11y, Navigation, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { NavigationOptions } from 'swiper/types/components/navigation'

import { NavButton } from './NavButton'

import 'swiper/swiper.min.css'

SwiperCore.use([Navigation, A11y])

interface TemplateGalleryCarouselProps<T> {
  items?: T[]
  renderItem: (itemProps: T[keyof T]) => JSX.Element
  heading?: string
  breakpoints: SwiperOptions['breakpoints']
  loading?: boolean
}

export function TemplateGalleryCarousel({
  items,
  renderItem,
  heading = '',
  breakpoints,
  loading
}: TemplateGalleryCarouselProps): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()

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

  console.log('journeys', items, loading)

  return (
    <Box sx={{ position: 'relative' }}>
      {heading != null && <Typography variant="h5">{heading}</Typography>}
      {loading === true && (items === null || items?.length === 0) && (
        <Swiper breakpoints={breakpoints}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
            <SwiperSlide key={`${heading as string}-item-${index}`}>
              {renderItem({})}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      {loading !== true && items != null && items?.length > 0 && (
        <Swiper
          freeMode
          speed={850}
          watchOverflow
          allowTouchMove
          observer
          observeParents
          resizeObserver
          breakpoints={breakpoints}
          style={{ overflow: 'visible', marginTop: 16 }}
          onSwiper={(swiper) => setSwiper(swiper)}
        >
          {items?.map((item, index) => (
            <SwiperSlide
              key={item?.id}
              data-testid={`journey-${(item?.id as string) ?? index}`}
              style={{ width: 'unset' }}
            >
              {renderItem({ item, index })}
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <NavButton variant="prev" ref={prevRef} disabled={items == null} />
      <NavButton variant="next" ref={nextRef} disabled={items == null} />
    </Box>
  )
}
