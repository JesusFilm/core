import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'
import SwiperCore, { A11y, Navigation, SwiperOptions } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { NavigationOptions } from 'swiper/types/components/navigation'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/swiper.min.css'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation, A11y])

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
        <Swiper breakpoints={swiperBreakpoints}>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
          <SwiperSlide>
            <TemplateGalleryCard />
          </SwiperSlide>
        </Swiper>
      )}
      {loading !== true && journeys != null && journeys?.length > 0 && (
        <Swiper
          autoHeight
          speed={850}
          watchOverflow
          allowTouchMove
          observer
          observeParents
          breakpoints={swiperBreakpoints}
          navigation={{
            nextEl: nextRef.current,
            prevEl: prevRef.current
          }}
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
