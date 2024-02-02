import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import { ReactElement, useEffect, useRef } from 'react'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import {
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { useTheme } from '@mui/material/styles'
import { SwiperOptions } from 'swiper/types'
import { JourneyFlow } from '../../JourneyFlow'
import { Canvas } from '../Canvas'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Drawer } from '../Drawer'

const StyledSwiper = styled(Swiper)(() => ({
  height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`
}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  padding: theme.spacing(4),
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
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

  function handleNext(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: activeSlide + 1
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
      allowTouchMove={false}
    >
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          right: 0,
          height: activeSlide == ActiveSlide.Drawer ? '20%' : '10%',
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: activeSlide > ActiveSlide.JourneyFlow ? 'block' : 'none',
            sm: 'none'
          }
        }}
      />
      <Box
        slot="container-end"
        onClick={handleNext}
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          right: 0,
          height: activeSlide == ActiveSlide.JourneyFlow ? '20%' : '10%',
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: activeSlide < ActiveSlide.Drawer ? 'block' : 'none',
            sm: 'none'
          }
        }}
      />
      <StyledSwiperSlide
        sx={{
          width: { xs: '100%', sm: 'calc(100% - 408px)' },
          height: { xs: '80%', sm: '100%' }
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
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
          width: { xs: '100%', sm: 'calc(100% - 120px - 360px)' },
          height: { xs: '80%', sm: '100%' },
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >
        <Box
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: -120,
            top: 0,
            bottom: 0,
            width: 120,
            zIndex: 2,
            cursor: 'pointer',
            display: {
              xs: 'none',
              sm: activeSlide === ActiveSlide.Canvas ? 'block' : 'none'
            }
          }}
        />
        <Canvas />
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
          width: (theme) => ({
            xs: '100%',
            sm: DRAWER_WIDTH + parseInt(theme.spacing(8)) // 328 DRAWER_WIDTH + 16px * 2 (padding L & R)
          }),
          height: { xs: '80%', sm: '100%' }
        }}
      >
        <Drawer />
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
