import { Typography } from '@mui/material'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import Zoom from '@mui/material/Zoom'
import { ReactElement, useEffect, useRef } from 'react'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import { ActiveSlide, useEditor } from '@core/journeys/ui/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'

import { Content } from './Content'
import { JourneyFlow } from './JourneyFlow'
import { Settings } from './Settings'

const StyledSwiper = styled(Swiper)(() => ({}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
  const { breakpoints } = useTheme()
  const swiperRef = useRef<SwiperRef>(null)
  const {
    state: { activeSlide, selectedStep },
    dispatch
  } = useEditor()

  const swiperBreakpoints: SwiperOptions['breakpoints'] = {
    [breakpoints.values.xs]: {
      direction: 'vertical',
      centeredSlides: true,
      centeredSlidesBounds: true
    },
    [breakpoints.values.sm]: {
      direction: 'horizontal'
    }
  }

  useEffect(() => {
    if (
      swiperRef.current != null &&
      swiperRef.current.swiper.activeIndex !== activeSlide
    ) {
      swiperRef.current.swiper.slideTo(activeSlide)
    }
  }, [activeSlide])

  function resetCanvasFocus(): void {
    if (isSlideChangingTo(ActiveSlide.JourneyFlow)) {
      dispatch({
        type: 'SetSelectedBlockOnlyAction',
        selectedBlock: selectedStep
      })
    }
  }

  function isSlideChangingTo(slide): boolean {
    return (
      swiperRef.current != null &&
      swiperRef.current?.swiper.activeIndex === slide
    )
  }

  function handlePrev(): void {
    console.log('Back button clicked')
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide - 1
    })
  }

  return (
    <StyledSwiper
      data-testid="Slider"
      ref={swiperRef}
      slidesPerView="auto"
      breakpoints={swiperBreakpoints}
      onActiveIndexChange={(swiper) => {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: swiper.activeIndex
        })
      }}
      onTransitionEnd={resetCanvasFocus}
      sx={{
        height: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px)`
      }}
    >
      {/* back (mobile top) button */}
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: activeSlide === ActiveSlide.Content ? 5 : -75,
          right: 0,
          height: 40,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'flex',
            sm: 'none'
          },
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) => theme.transitions.create('top')
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider',
            '&:hover': {
              backgroundColor: 'background.paper'
            }
          }}
        >
          <ChevronUpIcon />
        </IconButton>
      </Box>
      {/* back (desktop left) button */}
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'fixed',
          top: EDIT_TOOLBAR_HEIGHT,
          bottom: 0,
          left: activeSlide > ActiveSlide.JourneyFlow ? 0 : -103,
          width: 103,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'none',
            sm: 'flex'
          },
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) =>
            theme.transitions.create('left', { duration: 300, delay: 300 })
        }}
      >
        <IconButton
          sx={{
            backgroundColor: 'background.paper',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'divider'
          }}
        >
          <ChevronLeftIcon />
          <Typography>Back to Map</Typography>
        </IconButton>
      </Box>
      <StyledSwiperSlide
        className="swiper-no-swiping"
        sx={{
          p: { xs: 0, sm: 4 },
          width: { xs: '100%', sm: 'calc(100% - 408px)' },
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 50px)`,
            sm: '100%'
          }
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            borderTopLeftRadius: { xs: 0, sm: 16 },
            borderTopRightRadius: { xs: 0, sm: 16 },
            border: (theme) => ({ sm: `1px solid ${theme.palette.divider}` }),
            borderBottom: (theme) => ({
              xs: `1px solid ${theme.palette.divider}`
            }),
            backgroundSize: '20px 20px',
            backgroundColor: '#eff2f5',
            height: '100%'
          }}
        >
          <JourneyFlow />
        </Box>
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          p: { xs: 0, sm: 4 },
          width: { xs: '100%', sm: 'calc(100% - 120px - 360px)' },
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 100px)`,
            sm: '100%'
          },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { sm: 'space-between' },
          position: 'relative'
        }}
      >
        {/* slide bar (mobile bottom) */}
        <Box
          sx={{
            display: {
              xs: 'flex',
              sm: 'none'
            },
            alignItems: 'center',
            justifyContent: 'center',
            height: '40px'
          }}
        >
          <Zoom in={activeSlide === ActiveSlide.JourneyFlow}>
            <Box
              sx={{
                width: 56,
                height: 6,
                bgcolor: '#AAACBB',
                borderRadius: '3px'
              }}
            />
          </Zoom>
        </Box>
        <Content />
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          p: { xs: 0, sm: 4 },
          width: (theme) => ({
            xs: '100%',
            sm: DRAWER_WIDTH + parseInt(theme.spacing(8)) // 328 DRAWER_WIDTH + 16px * 2 (padding L & R)
          }),
          height: {
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 50px)`,
            sm: '100%'
          }
        }}
      >
        <Settings />
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
