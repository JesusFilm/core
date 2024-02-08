import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useRef } from 'react'
import { use100vh } from 'react-div-100vh'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import {
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'

import { JourneyFlow } from '../../JourneyFlow'
import { Canvas } from '../Canvas'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Attributes } from '../Drawer/Attributes'

const StyledSwiper = styled(Swiper)(() => ({
  height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`
}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
  const viewportHeight = use100vh()
  const { breakpoints } = useTheme()
  const swiperRef = useRef<SwiperRef>(null)
  const {
    state: { activeSlide },
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

  function handlePrev(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide - 1
    })
  }

  useEffect(() => {
    if (
      swiperRef.current != null &&
      swiperRef.current.swiper.activeIndex !== activeSlide
    ) {
      swiperRef.current.swiper.slideTo(activeSlide)
    }
  }, [activeSlide])

  return (
    <StyledSwiper
      ref={swiperRef}
      slidesPerView="auto"
      breakpoints={swiperBreakpoints}
      onActiveIndexChange={(swiper) => {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: swiper.activeIndex
        })
      }}
    >
      {/* back (desktop left) button */}
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          top: '50%',
          height: 42,
          marginTop: '-21px',
          left: activeSlide > ActiveSlide.JourneyFlow ? 33 : -42,
          width: 42,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'none',
            sm: 'flex'
          },
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) => theme.transitions.create('left')
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
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <StyledSwiperSlide
        className="swiper-no-swiping"
        sx={{
          p: { xs: 0, sm: 4 },

          width: { xs: '100%', sm: 'calc(100% - 408px)' },
          height: {
            xs: `calc(${
              viewportHeight != null ? `${viewportHeight}px` : '100vh'
            } - 75px - ${EDIT_TOOLBAR_HEIGHT}px)`,
            sm: '100%'
          }
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
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
            xs: `calc(${
              viewportHeight != null ? `${viewportHeight}px` : '100vh'
            } - 150px - ${EDIT_TOOLBAR_HEIGHT}px)`,
            sm: '100%'
          },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { sm: 'space-between' },
          position: 'relative'
        }}
      >
        <Box
          sx={{
            display: { xs: 'flex', sm: 'none' },
            alignItems: 'center',
            justifyContent: 'center',
            py: 2
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 6,
              bgcolor: '#AAACBB',
              borderRadius: '3px'
            }}
          />
        </Box>
        <Canvas />
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          p: { xs: 0, sm: 4 },
          width: (theme) => ({
            xs: '100%',
            sm: DRAWER_WIDTH + parseInt(theme.spacing(8)) // 328 DRAWER_WIDTH + 16px * 2 (padding L & R)
          }),
          height: {
            xs: `calc(${
              viewportHeight != null ? `${viewportHeight}px` : '100vh'
            } - 75px - ${EDIT_TOOLBAR_HEIGHT}px)`,
            sm: '100%'
          }
        }}
      >
        <Attributes />
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
