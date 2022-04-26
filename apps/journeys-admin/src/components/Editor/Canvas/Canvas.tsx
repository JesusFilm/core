import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import { ReactElement, useEffect, useState } from 'react'
import {
  BlockRenderer,
  useEditor,
  ActiveTab,
  ActiveFab
} from '@core/journeys/ui'
import { ThemeProvider } from '@core/shared/ui'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FramePortal } from '../../FramePortal'
import { DRAWER_WIDTH } from '../Drawer'
import 'swiper/swiper.min.css'
import { useJourney } from '../../../libs/context'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'
import { CardWrapper } from './CardWrapper'

const EDGE_SLIDE_WIDTH = 24
const MIN_SPACE_BETWEEN = 16
const TASKBAR_WIDTH = 72

export function Canvas(): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [spaceBetween, setSpaceBetween] = useState(16)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { steps, selectedStep, selectedBlock },
    dispatch
  } = useEditor()
  const journey = useJourney()

  useEffect(() => {
    if (swiper != null && selectedStep != null && steps != null) {
      swiper.slideTo(steps.findIndex(({ id }) => id === selectedStep.id))
    }
  }, [steps, swiper, selectedStep])

  useEffect(() => {
    const setSpaceBetweenOnResize = (): void => {
      const spaceBetween = Math.max(
        MIN_SPACE_BETWEEN,
        (window.innerWidth -
          Number(smUp) * (DRAWER_WIDTH + TASKBAR_WIDTH) -
          362 -
          EDGE_SLIDE_WIDTH * 2) /
          2
      )

      setSpaceBetween(spaceBetween)
    }

    // Set initial windowWidth
    setSpaceBetweenOnResize()

    window.addEventListener('resize', setSpaceBetweenOnResize)
    return () => window.removeEventListener('resize', setSpaceBetweenOnResize)
  }, [smUp])

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        paddingY: 9,
        '& .swiper-container': {
          paddingX: 6
        },
        '& .swiper-slide': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}
      onClick={() => {
        dispatch({
          type: 'SetSelectedBlockAction',
          block: selectedStep
        })
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({ type: 'SetSelectedAttributeIdAction', id: undefined })
      }}
    >
      <Swiper
        slidesPerView={'auto'}
        spaceBetween={spaceBetween}
        centeredSlides={true}
        shortSwipes={false}
        slideToClickedSlide={steps != null}
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={(swiper) => {
          if (steps == null) return

          dispatch({
            type: 'SetSelectedStepAction',
            step: steps[swiper.activeIndex]
          })
        }}
      >
        {steps != null ? (
          steps.map((step) => (
            <SwiperSlide key={step.id} style={{ width: 362 }}>
              <Box
                data-testid={`step-${step.id}`}
                sx={{
                  borderRadius: 5,
                  transition: '0.2s all ease-out 0.1s',
                  position: 'relative',
                  overflow: 'hidden',
                  border: (theme) =>
                    step.id === selectedBlock?.id
                      ? `2px solid ${theme.palette.primary.main}`
                      : `2px solid ${theme.palette.background.default}`,
                  transform:
                    step.id === selectedStep?.id ? 'scaleY(1)' : 'scaleY(0.9)',
                  height: 536
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 1,
                    transition: '0.2s opacity ease-out 0.1s',
                    backgroundColor: (theme) =>
                      theme.palette.background.default,
                    opacity: step.id === selectedStep?.id ? 0 : 1,
                    pointerEvents:
                      step.id === selectedStep?.id ? 'none' : 'auto'
                  }}
                />
                <FramePortal width={356} height={536}>
                  <ThemeProvider
                    themeName={journey?.themeName ?? ThemeName.base}
                    themeMode={journey?.themeMode ?? ThemeMode.light}
                  >
                    <Box sx={{ p: 1, height: '100%' }}>
                      <BlockRenderer
                        block={step}
                        wrappers={{
                          Wrapper: SelectableWrapper,
                          TypographyWrapper: InlineEditWrapper,
                          ButtonWrapper: InlineEditWrapper,
                          RadioQuestionWrapper: InlineEditWrapper,
                          RadioOptionWrapper: InlineEditWrapper,
                          SignUpWrapper: InlineEditWrapper,
                          VideoWrapper,
                          CardWrapper
                        }}
                      />
                    </Box>
                  </ThemeProvider>
                </FramePortal>
              </Box>
            </SwiperSlide>
          ))
        ) : (
          <>
            <SwiperSlide style={{ width: 362 }}>
              <Skeleton
                variant="rectangular"
                width={362}
                height={536}
                sx={{ borderRadius: 5 }}
              />
            </SwiperSlide>
            <SwiperSlide style={{ width: 362 }}>
              <Skeleton
                variant="rectangular"
                width={362}
                height={536}
                sx={{
                  borderRadius: 5,

                  transform: 'scaleY(0.9)'
                }}
              />
            </SwiperSlide>
          </>
        )}
      </Swiper>
    </Box>
  )
}
