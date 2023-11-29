import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'
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
  loadingSpacing?: ComponentProps<typeof Stack>['spacing']
}

export function TemplateGalleryCarousel<T>({
  items,
  renderItem,
  heading,
  breakpoints,
  loading = false,
  loadingSpacing
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
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {heading != null && <Typography variant="h5">{heading}</Typography>}
      {loading ? (
        <Stack
          direction="row"
          spacing={loadingSpacing}
          sx={{
            mt: 4,
            minWidth: 'max-content',
            boxSizing: 'unset'
          }}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            return (
              <Box key={`${heading ?? ''}-item-${i}`}>{renderItem({})}</Box>
            )
          })}
        </Stack>
      ) : (
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
          {items.map((item, index) => {
            return (
              <SwiperSlide
                key={item.id}
                data-testid={`journey-${item.id}`}
                onMouseOver={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => {
                  if (swiper?.isEnd as boolean) {
                    swiper?.slideTo(0)
                  }
                  swiper?.slideTo(index)
                }}
              >
                {renderItem({ item })}
              </SwiperSlide>
            )
          })}
        </StyledSwiperContainer>
      )}

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
