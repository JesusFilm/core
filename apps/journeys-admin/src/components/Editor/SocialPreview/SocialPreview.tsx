import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { useEditor } from '@core/journeys/ui/EditorProvider'

import { SocialPreviewMessage } from './Message/SocialPreviewMessage'
import { SocialPreviewPost } from './Post/SocialPreviewPost'

export function SocialPreview(): ReactElement {
  const { dispatch } = useEditor()
  // uses usemediaquery to force component reload for sizing
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const handleSocialEditFabClick = (): void => {
    dispatch({ type: 'SetDrawerMobileOpenAction', mobileOpen: true })
  }
  return (
    <>
      {mdUp ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-evenly"
          data-testid="SocialPreview"
          sx={{ width: '100%', height: '100%' }}
        >
          <SocialPreviewPost />
          <Divider
            orientation="vertical"
            sx={{
              height: '308px',
              bgcolor: '#DCDDE5',
              transform: 'scale(1.33)',
              transformOrigin: 'top center'
            }}
          />
          <SocialPreviewMessage />
        </Stack>
      ) : (
        <Box data-testid="SocialPreview">
          <Swiper
            modules={[Pagination]}
            id="social-swiper"
            slidesPerView={1}
            centeredSlides
            slideToClickedSlide
            pagination={{ clickable: true }}
            style={{ height: '330px' }}
          >
            <SwiperSlide
              key={0}
              onClick={handleSocialEditFabClick}
              style={{ cursor: 'pointer' }}
            >
              <SocialPreviewPost />
            </SwiperSlide>
            <SwiperSlide
              key={1}
              onClick={handleSocialEditFabClick}
              style={{ cursor: 'pointer' }}
            >
              <SocialPreviewMessage />
            </SwiperSlide>
          </Swiper>
        </Box>
      )}
    </>
  )
}
