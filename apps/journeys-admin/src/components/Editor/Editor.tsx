import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
// import dynamic from 'next/dynamic'
import { ReactElement } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveJourneyEditContent,
  EditorProvider
} from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'

import { BlockFields_StepBlock as StepBlock } from '../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../__generated__/GetJourney'
import { JourneyFlow } from '../JourneyFlow'

import { Canvas } from './Canvas'
import { ControlPanel } from './ControlPanel'
import { Drawer } from './Drawer'
import { EditToolbar } from './EditToolbar'
import { Properties } from './Properties'

// const ActionsTable = dynamic(
//   async () =>
//     await import(
//       /* webpackChunkName: "Editor/ActionsTable" */
//       './ActionsTable'
//     ).then((mod) => mod.ActionsTable),
//   { ssr: false }
// )
// const SocialPreview = dynamic(
//   async () =>
//     await import(
//       /* webpackChunkName: "Editor/SocialPreview" */
//       './SocialPreview'
//     ).then((mod) => mod.SocialPreview),
//   { ssr: false }
// )

const StyledSwiper = styled(Swiper)(() => ({
  height: '100%'
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
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

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
        {({ journeyEditContentComponent, activeSlide }) => (
          <Stack sx={{ height: '100vh' }}>
            <EditToolbar />
            <Box sx={{ flexGrow: 1 }}>
              <StyledSwiper
                modules={[Pagination]}
                slidesPerView="auto"
                pagination={{ clickable: true }}
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
                    '&.swiper-slide-next > .MuiBox-root': {
                      left: 0
                    },
                    '&.swiper-slide-active > .MuiBox-root': {
                      left: '50%',
                      transform: 'translateX(-50%)'
                    },
                    '&.swiper-slide-prev > .MuiBox-root': {
                      left: '100%',
                      transform: 'translateX(-100%)'
                    }
                  }}
                >
                  {/* {
                    {
                      [ActiveJourneyEditContent.Canvas]: <Canvas />,
                      [ActiveJourneyEditContent.Action]: <ActionsTable />,
                      [ActiveJourneyEditContent.SocialPreview]: (
                        <SocialPreview />
                      )
                    }[journeyEditContentComponent]
                  } */}
                  <Box
                    sx={{
                      width: 455,
                      pr: 4,
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
                </StyledSwiperSlide>
                <StyledSwiperSlide>
                  <Box
                    sx={{
                      p: 4,
                      height: 'calc(100% - 32px)'
                    }}
                  >
                    <Drawer />
                  </Box>
                </StyledSwiperSlide>
              </StyledSwiper>
            </Box>
            {!smUp && <ControlPanel />}
          </Stack>
        )}
      </EditorProvider>
    </JourneyProvider>
  )
}
