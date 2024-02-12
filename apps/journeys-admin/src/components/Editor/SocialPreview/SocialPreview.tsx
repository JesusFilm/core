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
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'

export function SocialPreview(): ReactElement {
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()
  // uses usemediaquery to force component reload for sizing
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
  }

  return (
    <>
      {mdUp ? (
        <Stack
          onClick={handleSelect}
          direction="row"
          alignItems="center"
          justifyContent={
            activeSlide === ActiveSlide.Content ? 'space-evenly' : 'flex-start'
          }
          data-testid="SocialPreview"
          sx={{
            width: '100%',
            height: '100%'
          }}
        >
          <Box sx={{ ml: 17.5 }}>
            <SocialPreviewPost />
          </Box>
          {activeSlide === ActiveSlide.Content && (
            <>
              <Divider
                orientation="vertical"
                sx={{
                  height: '308px',
                  bgcolor: '#DCDDE5',
                  transform: 'scale(1.33)',
                  transformOrigin: 'center'
                }}
              />
              <SocialPreviewMessage />
            </>
          )}
        </Stack>
      ) : (
        <Box
          data-testid="SocialPreview"
          width="100%"
          height="100%"
          alignItems="center"
          display="flex"
        >
          <Swiper
            modules={[Pagination]}
            id="social-swiper"
            slidesPerView={1}
            centeredSlides
            slideToClickedSlide
            pagination={{ clickable: true }}
            spaceBetween={80}
          >
            <SwiperSlide
              key={0}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <SocialPreviewPost />
            </SwiperSlide>
            <SwiperSlide
              key={1}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <SocialPreviewMessage />
            </SwiperSlide>
          </Swiper>
        </Box>
      )}
    </>
  )
}
