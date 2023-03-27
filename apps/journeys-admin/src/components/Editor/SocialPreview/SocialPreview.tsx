import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import SwiperCore, { Pagination } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { SocialPreviewPost } from './Post/SocialPreviewPost'
import { SocialPreviewMessage } from './Message/SocialPreviewMessage'
import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'

SwiperCore.use([Pagination])

export function SocialPreview(): ReactElement {
  const { journey } = useJourney()

  return (
    <>
      <Box display={{ xs: 'none', sm: 'inherit' }}>
        <Stack
          direction="row"
          justifyContent="space-evenly"
          alignContent="start"
          divider={
            <Divider
              orientation="vertical"
              sx={{
                width: '2px',
                height: '308px',
                bgcolor: '#DCDDE5',
                display: { xs: 'none', sm: 'inherit' }
              }}
            />
          }
        >
          <SocialPreviewPost journey={journey} />
          <SocialPreviewMessage journey={journey} />
        </Stack>
      </Box>
      <Box display={{ xs: 'block', sm: 'none' }}>
        <Swiper
          slidesPerView={1}
          centeredSlides
          slideToClickedSlide
          pagination={{ clickable: true }}
          style={{ height: '300px' }}
        >
          <SwiperSlide key={0}>
            <SocialPreviewPost journey={journey} />
          </SwiperSlide>
          <SwiperSlide key={1}>
            <SocialPreviewMessage journey={journey} />
          </SwiperSlide>
        </Swiper>
      </Box>
    </>
  )
}
