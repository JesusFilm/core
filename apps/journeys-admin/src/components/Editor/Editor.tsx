import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import { ReactElement, useCallback, useRef } from 'react'
import { Swiper, SwiperRef, SwiperSlide } from 'swiper/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { JourneyFlow } from '../JourneyFlow'

import { Canvas } from './Canvas'
import { Drawer } from './Drawer'
import { EDIT_TOOLBAR_HEIGHT, EditToolbar } from './EditToolbar'
import { Properties } from './Properties'

const StyledSwiper = styled(Swiper)(() => ({
  height: `calc(100vh - ${EDIT_TOOLBAR_HEIGHT}px)`
}))
const StyledSwiperSlide = styled(SwiperSlide)(() => ({
  width: 'calc(100% - 463px)'
}))

interface EditorProps {
  journey?: Journey
  selectedStepId?: string
  view?: ActiveJourneyEditContent
}

export function Editor({
  journey,
  selectedStepId,
  view
}: EditorProps): ReactElement {
  const steps =
    journey != null
      ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
      : undefined
  const selectedStep =
    selectedStepId != null && steps != null
      ? steps.find(({ id }) => id === selectedStepId)
      : undefined
  const swiperRef = useRef<SwiperRef>(null)
  const handlePrev = useCallback(() => {
    swiperRef.current?.swiper.slideTo(0)
  }, [])

  const handleNext = useCallback(() => {
    swiperRef.current?.swiper.slideTo(2)
  }, [])

  return (
    <JourneyProvider value={{ journey, variant: 'admin' }}>
      <EditorProvider
        initialState={{
          steps,
          selectedStep,
          drawerTitle: 'Properties',
          drawerChildren: <Properties isPublisher={false} />,
          journeyEditContentComponent: view ?? ActiveJourneyEditContent.Canvas
        }}
      >
        {({ activeSlide }) => (
          <>
            <EditToolbar />
            <StyledSwiper
              ref={swiperRef}
              slidesPerView="auto"
              centeredSlides
              centeredSlidesBounds
              allowTouchMove={false}
            >
              <StyledSwiperSlide>
                <Box
                  sx={{
                    height: 'calc(100% - 32px)',
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    backgroundSize: '20px 20px',
                    m: 4,
                    backgroundColor: '#eff2f5'
                  }}
                >
                  <JourneyFlow />
                </Box>
              </StyledSwiperSlide>
              <StyledSwiperSlide
                sx={{
                  '& .navigation-prev, & .navigation-next': {
                    display: 'none'
                  },
                  '&.swiper-slide-next .card-root': {
                    left: 0
                  },
                  '&.swiper-slide-active': {
                    '& .navigation-prev, & .navigation-next': {
                      display: 'block'
                    },
                    '& .card-root': {
                      left: '50%',
                      transform: 'translateX(-50%)'
                    }
                  },
                  '&.swiper-slide-prev .card-root': {
                    left: '100%',
                    transform: 'translateX(-100%)'
                  }
                }}
              >
                <Box
                  className="navigation-prev"
                  onClick={handlePrev}
                  sx={{
                    position: 'absolute',
                    left: -230,
                    top: 0,
                    bottom: 0,
                    width: 230,
                    zIndex: 2,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  className="navigation-next"
                  onClick={handleNext}
                  sx={{
                    position: 'absolute',
                    right: -230,
                    top: 0,
                    bottom: 0,
                    width: 230,
                    zIndex: 2,
                    cursor: 'pointer'
                  }}
                />
                <Box
                  sx={{
                    p: 4,
                    height: 'calc(100% - 32px)'
                  }}
                >
                  <Box
                    className="card-root"
                    sx={{
                      width: 455,
                      height: '100%',
                      position: 'relative',
                      transition: (theme) =>
                        theme.transitions.create(['left', 'transform'], {
                          duration: 300
                        })
                    }}
                  >
                    <Canvas />
                  </Box>
                </Box>
              </StyledSwiperSlide>
              <StyledSwiperSlide>
                <Box
                  sx={{
                    p: 4,
                    height: 'calc(100% - 32px)',
                    minWidth: 0
                  }}
                >
                  <Drawer />
                </Box>
              </StyledSwiperSlide>
            </StyledSwiper>
          </>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}
