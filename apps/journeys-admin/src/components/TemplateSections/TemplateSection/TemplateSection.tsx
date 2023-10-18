import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { ReactElement, useRef } from 'react'
import SwiperCore, { A11y, Navigation, SwiperOptions, Virtual } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/swiper.min.css'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation, A11y, Virtual])

interface TemplateSectionProps {
  journeys?: Journeys[]
  category: string
}

export function TemplateSection({
  journeys,
  category
}: TemplateSectionProps): ReactElement {
  const { breakpoints } = useTheme()
  const nextRef = useRef<HTMLButtonElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)
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
    <Stack spacing={4} justifyContent="center" sx={{ position: 'relative' }}>
      {journeys == null && (
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
      {journeys != null && (
        <>
          <Typography variant="h5">{category}</Typography>
          <Swiper
            autoHeight
            speed={850}
            watchOverflow
            breakpoints={swiperBreakpoints}
            navigation={{
              nextEl: nextRef.current,
              prevEl: prevRef.current
            }}
            virtual
            style={{
              overflow: 'visible'
            }}
          >
            {journeys?.map((journey) => (
              <SwiperSlide
                key={journey?.id}
                data-testId={`journey-${journey.id}`}
              >
                <TemplateGalleryCard journey={journey} />
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}
      <NavButton variant="prev" ref={prevRef} disabled={journeys == null} />
      <NavButton variant="next" ref={nextRef} disabled={journeys == null} />
    </Stack>
  )
}
