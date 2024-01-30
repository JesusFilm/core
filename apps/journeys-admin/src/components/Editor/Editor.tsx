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
const StyledSwiperSlide = styled(SwiperSlide)(({ theme }) => ({
  padding: theme.spacing(4),
  boxSizing: 'border-box'
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
        {({ dispatch }) => (
          <>
            <EditToolbar />
            <StyledSwiper
              ref={swiperRef}
              slidesPerView="auto"
              allowTouchMove={false}
              onActiveIndexChange={(swiper) => {
                dispatch({
                  type: 'SetActiveSlideAction',
                  activeSlide: swiper.activeIndex
                })
              }}
            >
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
          </>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}
