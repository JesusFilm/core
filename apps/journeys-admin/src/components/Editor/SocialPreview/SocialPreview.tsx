import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'

import { SocialPreviewMessage } from './Message/SocialPreviewMessage'
import { SocialPreviewPost } from './Post/SocialPreviewPost'

export function SocialPreview(): ReactElement {
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
  }

  return (
    <>
      {smUp ? (
        <Stack
          onClick={handleSelect}
          direction="row"
          alignItems="center"
          data-testid="SocialPreview"
          sx={{ width: '100%' }}
        >
          <Stack
            flexGrow={1}
            alignItems="center"
            sx={{
              cursor:
                activeSlide === ActiveSlide.JourneyFlow ? 'pointer' : undefined,
              flexGrow: activeSlide === ActiveSlide.Content ? 1 : 0,
              minWidth: 387,
              transition: (theme) =>
                theme.transitions.create('flex-grow', { duration: 300 })
            }}
          >
            <SocialPreviewPost />
          </Stack>
          <Divider orientation="vertical" sx={{ height: 300 }} />
          <Stack
            flexGrow={1}
            alignItems="center"
            sx={{
              flexGrow: 1,
              opacity: activeSlide === ActiveSlide.Content ? 1 : 0,
              transition: (theme) =>
                theme.transitions.create(['flex-grow', 'opacity'], {
                  duration: 300
                })
            }}
          >
            <SocialPreviewMessage />
          </Stack>
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
