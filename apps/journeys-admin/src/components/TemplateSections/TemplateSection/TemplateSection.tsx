import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { ReactElement, useEffect, useRef } from 'react'
import SwiperCore, { Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/swiper.min.css'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation])

interface TemplateSectionProps {
  journeys?: Journeys[]
  category: string
}

export function TemplateSection({
  journeys,
  category
}: TemplateSectionProps): ReactElement {
  const nextRef = useRef<HTMLButtonElement>(null)
  const prevRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleResize = (): void => {
      const width = window.innerWidth
      if (width <= 1199) {
        document.querySelectorAll('.swiper-slide').forEach((swiperSlide) => {
          const slide = swiperSlide as HTMLElement
          slide.style.width = '124px'
        })
      }
      if (width >= 1200) {
        document.querySelectorAll('.swiper-slide').forEach((swiperSlide) => {
          const slide = swiperSlide as HTMLElement
          slide.style.width = '180px'
        })
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <Stack spacing={4} justifyContent="center" sx={{ position: 'relative' }}>
      <Typography variant="h2">{category}</Typography>
      <Swiper
        autoHeight
        slidesPerView="auto"
        spaceBetween={25}
        lazy={{ loadPrevNext: true }}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
      >
        {journeys?.map((journey) => (
          <SwiperSlide
            key={journey?.id}
            data-testId={`journey-${journey.id}`}
            style={{
              width: 180
            }}
          >
            <TemplateGalleryCard journey={journey} />
          </SwiperSlide>
        ))}
      </Swiper>
      <NavButton variant="prev" ref={prevRef} disabled={journeys == null} />
      <NavButton variant="next" ref={nextRef} disabled={journeys == null} />
    </Stack>
  )
}
