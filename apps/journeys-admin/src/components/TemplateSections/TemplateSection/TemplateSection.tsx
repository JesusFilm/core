import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { ReactElement, useRef, useState } from 'react'
import SwiperCore, { A11y, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/swiper.min.css'
import { NavButton } from './NavButton'

SwiperCore.use([Navigation, A11y])

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
  const [isAtBeginning, setIsAtBeginning] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)

  console.log(isAtEnd)

  return (
    <Stack spacing={4} justifyContent="center" sx={{ position: 'relative' }}>
      <Typography variant="h2">{category}</Typography>
      <Swiper
        autoHeight
        watchOverflow
        slidesPerView="auto"
        spaceBetween={36}
        navigation={{
          nextEl: nextRef.current,
          prevEl: prevRef.current
        }}
        onSlideChange={(swiper) => {
          setIsAtBeginning(swiper.isBeginning)
          setIsAtEnd(swiper.isEnd)
          console.log(swiper)
        }}
      >
        {journeys?.map((journey) => (
          <SwiperSlide
            key={journey?.id}
            data-testId={`journey-${journey.id}`}
            style={{
              width: 184
            }}
          >
            <TemplateGalleryCard journey={journey} />
          </SwiperSlide>
        ))}
      </Swiper>
      <NavButton
        variant="prev"
        ref={prevRef}
        disabled={journeys == null}
        start={isAtBeginning}
      />
      <NavButton
        variant="next"
        ref={nextRef}
        disabled={journeys == null}
        end={isAtEnd}
      />
    </Stack>
  )
}
