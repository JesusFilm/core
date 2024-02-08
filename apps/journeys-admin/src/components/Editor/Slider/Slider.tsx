import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useRef } from 'react'
import { use100vh } from 'react-div-100vh'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import {
  ActiveJourneyEditContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import ChevronDownIcon from '@core/shared/ui/icons/ChevronDown'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { JourneyFlow } from '../../JourneyFlow'
import { ActionsTable } from '../ActionsTable'
import { Canvas } from '../Canvas'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Attributes } from '../Drawer/Attributes'
import { SocialPreview } from '../SocialPreview'

const StyledSwiper = styled(Swiper)(() => ({
  height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`
}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  padding: theme.spacing(4),
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
  const viewportHeight = use100vh()
  const { breakpoints } = useTheme()
  const swiperRef = useRef<SwiperRef>(null)
  const {
    state: { activeSlide, journeyEditContentComponent },
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

  let Content: () => ReactElement

  switch (journeyEditContentComponent) {
    case ActiveJourneyEditContent.SocialPreview:
      Content = SocialPreview
      break
    case ActiveJourneyEditContent.Action:
      Content = ActionsTable
      break
    default:
      Content = Canvas
      break
  }

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
          left: activeSlide > ActiveSlide.JourneyFlow ? 0 : -120,
          top: 0,
          bottom: 0,
          width: 120,
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
      <Box
        slot="container-start"
        onClick={handlePrev}
        sx={{
          position: 'absolute',
          left: 0,
          top: activeSlide > ActiveSlide.JourneyFlow ? 0 : -75,
          right: 0,
          height: 75,
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
      <Box
        slot="container-end"
        onClick={handleNext}
        sx={{
          position: 'absolute',
          left: 0,
          bottom: activeSlide < ActiveSlide.Drawer ? 0 : -75,
          right: 0,
          height: 75,
          zIndex: 2,
          cursor: 'pointer',
          display: {
            xs: 'flex',
            sm: 'none'
          },
          alignItems: 'center',
          justifyContent: 'center',
          transition: (theme) => theme.transitions.create('bottom')
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
          <ChevronDownIcon />
        </IconButton>
      </Box>
      <StyledSwiperSlide
        sx={{
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
          height: {
            xs: `calc(${
              viewportHeight != null ? `${viewportHeight}px` : '100vh'
            } - 150px - ${EDIT_TOOLBAR_HEIGHT}px)`,
            sm: '100%'
          },
          display: 'flex',
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >
        <TransitionGroup
          component={Box}
          sx={{
            position: 'relative',
            flexGrow: 1,
            '& .journey-edit-content-component-enter': {
              opacity: 0
            },
            '& .journey-edit-content-component-enter-active': {
              opacity: 1
            },
            '& .journey-edit-content-component-enter-done': {
              opacity: 1
            },
            '& .journey-edit-content-component-exit': {
              opacity: 1
            },
            '& .journey-edit-content-component-exit-active': {
              opacity: 0
            }
          }}
        >
          <CSSTransition
            key={journeyEditContentComponent}
            timeout={600}
            classNames="journey-edit-content-component"
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                display: 'flex',
                justifyContent: 'space-between',
                transition: (theme) =>
                  `${theme.transitions.create('opacity', {
                    duration: 300
                  })}`
              }}
            >
              <Content />
            </Box>
          </CSSTransition>
        </TransitionGroup>
      </StyledSwiperSlide>
      <StyledSwiperSlide
        sx={{
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
