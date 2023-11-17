import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import SwiperCore from 'swiper'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { SocialPreviewMessage } from './Message/SocialPreviewMessage'
import { SocialPreviewPost } from './Post/SocialPreviewPost'
import 'swiper/css'
import 'swiper/css/pagination'

SwiperCore.use([Pagination])

export function SocialPreview(): ReactElement {
  const { journey } = useJourney()
  const { dispatch } = useEditor()
  // uses usemediaquery to force component reload for sizing
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const handleSocialEditFabClick = (): void => {
    dispatch({ type: 'SetDrawerMobileOpenAction', mobileOpen: true })
  }
  return (
    <>
      {mdUp ? (
        <Box data-testid="SocialPreview">
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
                  display: { sm: 'none', md: 'inherit' }
                }}
              />
            }
          >
            <SocialPreviewPost journey={journey} />
            <SocialPreviewMessage journey={journey} />
          </Stack>
        </Box>
      ) : (
        <Box data-testid="SocialPreview">
          <Swiper
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
              <SocialPreviewPost journey={journey} />
            </SwiperSlide>
            <SwiperSlide
              key={1}
              onClick={handleSocialEditFabClick}
              style={{ cursor: 'pointer' }}
            >
              <SocialPreviewMessage journey={journey} />
            </SwiperSlide>
          </Swiper>
        </Box>
      )}
    </>
  )
}
