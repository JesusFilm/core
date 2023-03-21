import { ReactElement } from 'react'
import { Navigation, Pagination } from 'swiper'

import Div100vh from 'react-div-100vh'
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react'
// Import Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'

const StyledSwiperContainer = styled(Swiper)(() => ({
  '.swiper-button-prev': {
    color: 'black',
    left: '36px'
  },
  '.swiper-button-next': {
    color: 'black',
    right: '36px'
  },
  '.swiper-pagination-bullets-dynamic': {
    color: 'black',
    bottom: '36px !important'
  },
  '.swiper-pagination-bullet-active': {
    background: 'black'
  }
}))
const StyledSwiperSlide = styled(SwiperSlide)(() => ({}))

export function TestConductor(): ReactElement {
  // const theme = useTheme()
  // const { journey } = useJourney()

  return (
    <Div100vh>
      <StyledSwiperContainer
        modules={[Navigation, Pagination]}
        navigation
        pagination={{
          dynamicBullets: true
        }}
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={() => console.log('slide change')}
        onSwiper={(swiper) => console.log(swiper)}
        sx={{ height: 'inherit' }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => {
          return (
            <StyledSwiperSlide key={number} sx={{ height: 'inherit' }}>
              <Stack sx={{ height: 'inherit' }}>
                <Paper
                  sx={{
                    width: '560px',
                    margin: 'auto',
                    height: '95%',
                    backgroundColor: 'divider'
                  }}
                >
                  <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ height: 'inherit' }}
                  >
                    Slide {number}
                  </Stack>
                </Paper>
              </Stack>
            </StyledSwiperSlide>
          )
        })}
      </StyledSwiperContainer>
    </Div100vh>
  )
}
