import { ReactElement, useCallback, useEffect, useRef } from 'react'
import { EDIT_TOOLBAR_HEIGHT } from '../EditToolbar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { JourneyFlow } from '../../JourneyFlow'
import {
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { Swiper, SwiperClass, SwiperRef, SwiperSlide } from 'swiper/react'

import { Canvas } from '../Canvas'
import { Drawer } from '../Drawer'

const StyledSwiper = styled(Swiper)(() => ({
  height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`
}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  padding: theme.spacing(4),
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
  const swiperRef = useRef<SwiperRef>(null)
  const {
    state: { activeSlide },
    dispatch
  } = useEditor()

  function handlePrev() {
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
    <StyledSwiper ref={swiperRef} slidesPerView="auto" allowTouchMove={false}>
      <StyledSwiperSlide
        sx={{
          width: 'calc(100% - 408px)'
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
          width: 'calc(100% - 120px)',
          display: 'flex',
          justifyContent: 'space-between',
          '& .navigation-prev': {
            display: 'none'
          },
          '&.swiper-slide-active': {
            '& .navigation-prev': {
              display: 'block'
            },
            '& .card-root': {
              flexGrow: 1
            }
          }
        }}
      >
        <Box
          className="navigation-prev"
          onMouseMove={handlePrev}
          onClick={handlePrev}
          sx={{
            position: 'absolute',
            left: -120,
            top: 0,
            bottom: 0,
            width: 120,
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
            width: 327
          }}
        >
          <Drawer />
        </Box>
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
