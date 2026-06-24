import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import type { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import type { ReactElement } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'

import { useEditorLayout } from '../../../EditorLayoutContext'

import { Message } from './Message/Message'
import { Post } from './Post/Post'

export function SocialPreview(): ReactElement {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('md'))
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()
  const { isLayered } = useEditorLayout()

  const contentActive = isLayered || activeSlide === ActiveSlide.Content

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: isLayered ? ActiveSlide.Drawer : ActiveSlide.Content
    })
  }

  return (
    <>
      {mdUp ? (
        <Stack
          height={736}
          width={isLayered ? 'auto' : contentActive ? '100%' : 387}
          data-testid="OuterStack"
          justifyContent="space-between"
          alignSelf="center"
          // the layered drawer paper is pointer-events: none so empty areas
          // close the drawer; the preview itself stays interactive
          sx={{ pointerEvents: isLayered ? 'auto' : undefined }}
        >
          <Stack
            onClick={handleSelect}
            direction="row"
            alignItems="center"
            data-testid="SocialPreview"
            height={682}
            width="100%"
            gap={isLayered ? 2 : 0}
          >
            <Stack
              alignItems="center"
              data-testid="SocialPostColumn"
              sx={{
                cursor: contentActive ? undefined : 'pointer',
                // the layered drawer sizes to content, so the columns need
                // fixed widths instead of the slider's flex-grow transition
                ...(isLayered
                  ? { width: 300, flexShrink: 0 }
                  : {
                      flexGrow: contentActive ? 1 : 0,
                      minWidth: 387,
                      transition: (theme) =>
                        theme.transitions.create('flex-grow', {
                          duration: 300
                        })
                    })
              }}
            >
              <Post />
            </Stack>
            <Divider orientation="vertical" sx={{ height: 300 }} />
            <Stack
              alignItems="center"
              data-testid="SocialMessageColumn"
              sx={{
                opacity: contentActive ? 1 : 0,
                ...(isLayered
                  ? { width: 387, flexShrink: 0 }
                  : {
                      flexGrow: 1,
                      transition: (theme) =>
                        theme.transitions.create(['flex-grow', 'opacity'], {
                          duration: 300
                        })
                    })
              }}
            >
              <Message />
            </Stack>
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
            style={{ paddingBottom: '20px' }}
          >
            <SwiperSlide
              key={0}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Post />
            </SwiperSlide>
            <SwiperSlide
              key={1}
              style={{
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'center'
              }}
            >
              <Message />
            </SwiperSlide>
          </Swiper>
        </Box>
      )}
    </>
  )
}
