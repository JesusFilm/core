import { ReactElement, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import {
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
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
      activeSlide: ActiveSlide.JourneyFlow
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
            left: { xs: 0, sm: -120 },
            top: { xs: '-20%', sm: 0 },
            bottom: { xs: 'initial', sm: 0 },
            right: { xs: 0, sm: 'initial' },
            width: { sm: 120 },
            height: { xs: '20%', sm: 'auto' },
            zIndex: 2,
            cursor: 'pointer'
          }}
        />
        <Box
          className="card-root"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 0,
            transition: (theme) =>
              theme.transitions.create('flex-grow', { duration: 300 })
          }}
        >
          <Canvas />
        </Box>
        <Box
          sx={{
            width: DRAWER_WIDTH
          }}
        >
          <Drawer />
        </Box>
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
