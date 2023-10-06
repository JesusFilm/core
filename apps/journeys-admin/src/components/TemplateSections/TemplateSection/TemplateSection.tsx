import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Stack from '@mui/system/Stack'
import { ReactElement, forwardRef, useRef } from 'react'
import SwiperCore, { A11y, Navigation } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

import { GetJourneys_journeys as Journeys } from '../../../../__generated__/GetJourneys'
import { TemplateGalleryCard } from '../../TemplateGalleryCard'

import 'swiper/swiper.min.css'

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
      <NavButton variant="prev" ref={prevRef} disabled={journeys == null} />
      <NavButton variant="next" ref={nextRef} disabled={journeys == null} />
    </Stack>
  )
}

interface NavButtonProps {
  variant: 'prev' | 'next'
  disabled?: boolean
}

const NavButton = forwardRef<HTMLButtonElement, NavButtonProps>(
  function NavButton({ variant, disabled = false }, ref): ReactElement {
    return (
      <IconButton
        ref={ref}
        sx={{
          position: 'absolute',
          zIndex: 2,
          backgroundColor: 'background.paper',
          opacity: { xs: 0, lg: disabled ? 0 : 1 },
          boxShadow: (theme) => theme.shadows[2],
          cursor: 'pointer',
          left: variant === 'prev' ? 0 : undefined,
          right: variant === 'next' ? 0 : undefined,
          '&:hover': {
            backgroundColor: 'background.paper'
          }
        }}
      >
        {variant === 'prev' ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    )
  }
)
