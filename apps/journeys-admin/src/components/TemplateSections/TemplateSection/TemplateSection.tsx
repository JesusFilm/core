import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'
import SwiperCore from 'swiper'
import { A11y, Mousewheel, Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'
import { NavigationOptions } from 'swiper/types/modules/navigation'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/css'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation, A11y, Mousewheel])

interface TemplateSectionProps {
  journeys?: Journeys[]
  category: string
  loading?: boolean
}

export function TemplateSection({
  journeys,
  category,
  loading
}: TemplateSectionProps): ReactElement {
  const { breakpoints } = useTheme()
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

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      slidesPerGroup: 2,
      slidesPerView: 2,
      spaceBetween: 20
    },
    [breakpoints.values.sm]: {
      slidesPerGroup: 3,
      slidesPerView: 3,
      spaceBetween: 20
    },
    [breakpoints.values.md]: {
      slidesPerGroup: 4,
      slidesPerView: 4,
      spaceBetween: 20
    },
    [breakpoints.values.lg]: {
      slidesPerGroup: 5,
      slidesPerView: 5,
      spaceBetween: 48
    },
    [breakpoints.values.xl]: {
      slidesPerGroup: 6,
      slidesPerView: 6,
      spaceBetween: 48
    },
    [breakpoints.values.xxl]: {
      slidesPerGroup: 7,
      slidesPerView: 7,
      spaceBetween: 48
    }
  }

  return (
    <Box sx={{ position: 'relative' }}>
      <Typography variant="h5">{category}</Typography>
      {loading === true && (journeys === null || journeys?.length === 0) && (
        <Stack sx={{ mt: 4 }} spacing={{ xs: 5, lg: 12 }} direction="row">
          <TemplateGalleryCard sx={{ flexGrow: 1 }} />
          <TemplateGalleryCard sx={{ flexGrow: 1 }} />
          <TemplateGalleryCard
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          />
          <TemplateGalleryCard
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}
          />
          <TemplateGalleryCard
            sx={{ flexGrow: 1, display: { xs: 'none', lg: 'block' } }}
          />
          <TemplateGalleryCard
            sx={{ flexGrow: 1, display: { xs: 'none', xl: 'block' } }}
          />
          <TemplateGalleryCard
            sx={{ flexGrow: 1, display: { xs: 'none', xxl: 'block' } }}
          />
        </Stack>
      )}
      {loading !== true && journeys != null && journeys?.length > 0 && (
        <Swiper
          mousewheel={{ forceToAxis: true }}
          freeMode
          speed={850}
          watchOverflow
          allowTouchMove
          observer
          observeParents
          breakpoints={swiperBreakpoints}
          style={{ overflow: 'visible', marginTop: 16 }}
          onSwiper={(swiper) => setSwiper(swiper)}
        >
          {journeys?.map((journey) => (
            <SwiperSlide
              key={journey?.id}
              data-testid={`journey-${journey.id}`}
            >
              <TemplateGalleryCard journey={journey} />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <NavButton variant="prev" ref={prevRef} disabled={journeys == null} />
      <NavButton variant="next" ref={nextRef} disabled={journeys == null} />
    </Box>
  )
}
