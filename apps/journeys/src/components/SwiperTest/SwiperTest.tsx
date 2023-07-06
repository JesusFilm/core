import { ReactElement, useState } from 'react'
import { useTheme, styled } from '@mui/material/styles'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore, { Pagination } from 'swiper'
import Div100vh from 'react-div-100vh'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

import 'swiper/swiper.min.css'
import 'swiper/components/pagination/pagination.min.css'
import { Typography } from '@mui/material'

SwiperCore.use([Pagination])

const StyledSwiperContainer = styled(Swiper)(({ theme }) => ({
  background: 'grey',
  height: 'inherit',
  '.swiper-pagination': {
    height: 16,
    top: 16
  },
  '.swiper-pagination-bullet': {
    background: theme.palette.common.white,
    opacity: '60%'
  },
  '.swiper-pagination-bullet-active': {
    opacity: '100%'
  }
}))

export function SwiperTest(): ReactElement {
  return (
    <Div100vh style={{ overflow: 'hidden' }}>
      <Stack
        sx={{
          justifyContent: 'center',
          height: '100%',
          background: 'grey'
        }}
      >
        <Box sx={{ height: { xs: '100%', lg: 'unset' } }}>
          <StyledSwiperContainer
            pagination={{ dynamicBullets: true }}
            slidesPerView="auto"
            centeredSlides
            centeredSlidesBounds
            resizeObserver
            allowTouchMove
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <SwiperSlide key={item}>
                <Stack
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    maxHeight: { xs: '100vh', lg: 'calc(100vh - 80px)' },
                    height: {
                      xs: 'inherit',
                      lg: 'calc(54.25vw + 102px)'
                    },
                    px: { lg: 6 }
                  }}
                >
                  <Typography>{`Slide ${item}`}</Typography>
                </Stack>
              </SwiperSlide>
            ))}
          </StyledSwiperContainer>
        </Box>
      </Stack>
    </Div100vh>
  )
}

// {
//   /* <Box sx={{ height: '100px', width: '100px', color: 'red' }} /> */
// }
// {
//   /* <Box sx={{ height: '100px', width: '100px', color: 'blue' }} /> */
// }
// {
//   /* <Box sx={{ height: '100px', width: '100px', color: 'green' }} /> */
// }
