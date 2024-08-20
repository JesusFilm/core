import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import kebabCase from 'lodash/kebabCase'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
  useState
} from 'react'
import { A11y, FreeMode, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'
import { NavigationOptions } from 'swiper/types/modules/navigation'

import { NavButton } from './NavButton'

const StyledSwiperContainer = styled(Swiper)(() => ({
  overflow: 'visible !important',
  marginTop: '16px',
  '.swiper-slide': {
    // Use important otherwise swiper overrides width on resize
    width: 'unset !important'
  }
}))

const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

interface ContentCarouselProps<T> {
  items: Array<T & { id: string }>
  renderItem: (itemProps: { item?: T; priority?: boolean }) => ReactNode
  heading?: string
  breakpoints: SwiperOptions['breakpoints']
  loading?: boolean
  cardSpacing?: ComponentProps<typeof Stack>['spacing']
  slidesOffsetBefore?: number
  priority?: boolean
  content?: string
}

export function ContentCarousel<T>({
  items,
  renderItem,
  heading,
  breakpoints,
  loading = false,
  cardSpacing,
  slidesOffsetBefore,
  priority,
  content
}: ContentCarouselProps<T>): ReactElement {
  const [swiper, setSwiper] = useState<SwiperClass>()
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
      data-testid={`${kebabCase(heading)}${
        content != null ? content : '-template-gallery'
      }-carousel`}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {heading != null && <Typography variant="h5">{heading}</Typography>}
      {loading ? (
        <Stack
          direction="row"
          spacing={cardSpacing}
          sx={{
            mt: 4,
            minWidth: 'max-content',
            boxSizing: 'unset',
            ml: slidesOffsetBefore != null ? slidesOffsetBefore / 4 : 0
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
          modules={[Navigation, Mousewheel, A11y, FreeMode]}
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
          sx={{ ml: slidesOffsetBefore != null ? slidesOffsetBefore / 4 : 0 }}
        >
          {items.map((item, index) => {
            return (
              <StyledSwiperSlide
                key={item.id}
                data-testid={`journey-${item.id}`}
                onFocus={() => {
                  if (swiper?.isEnd as boolean) {
                    swiper?.slideTo(0)
                  }
                  swiper?.slideTo(index)
                }}
                sx={{ mr: cardSpacing }}
              >
                {renderItem({ item, priority })}
              </StyledSwiperSlide>
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
