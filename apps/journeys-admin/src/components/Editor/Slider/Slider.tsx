import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { styled, useTheme } from '@mui/material/styles'
import { ReactElement, useEffect, useRef } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'
import { SwiperOptions } from 'swiper/types'

import {
  ActiveJourneyEditContent,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import ChevronLeftIcon from '@core/shared/ui/icons/ChevronLeft'
import ChevronUpIcon from '@core/shared/ui/icons/ChevronUp'

import { JourneyFlow } from '../../JourneyFlow'
import { ActionsTable } from '../ActionsTable'
import { Canvas } from '../Canvas'
import { DRAWER_WIDTH, EDIT_TOOLBAR_HEIGHT } from '../constants'
import { Attributes } from '../Drawer/Attributes'
import { SocialPreview } from '../SocialPreview'

const StyledSwiper = styled(Swiper)(() => ({}))
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  boxSizing: 'border-box'
}))

export function Slider(): ReactElement {
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
      onActiveIndexChange={(swiper) => {
        dispatch({
          type: 'SetActiveSlideAction',
          activeSlide: swiper.activeIndex
        })
      }}
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
            xs: `calc(100svh - ${EDIT_TOOLBAR_HEIGHT}px - 50px)`,
            sm: '100%'
          }
        }}
      >
        <Box
          sx={{
            borderRadius: 4,
            border: (theme) => ({ sm: `1px solid ${theme.palette.divider}` }),
            borderBottom: (theme) => ({
              xs: `1px solid ${theme.palette.divider}`
            }),
            backgroundSize: '20px 20px',
            backgroundColor: '#F1F1F1',
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
        <Box
          sx={{
            display: {
              xs: 'flex',
              sm: 'none'
            },
            alignItems: 'flex-end',
            justifyContent: 'center',
            height: activeSlide === ActiveSlide.JourneyFlow ? 16 : 0,
            flexShrink: 0,
            transition: (theme) => theme.transitions.create('height'),
            overflow: 'hidden'
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
        <Attributes />
      </StyledSwiperSlide>
    </StyledSwiper>
  )
}
