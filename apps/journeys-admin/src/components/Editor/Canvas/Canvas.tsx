import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Theme } from '@mui/material/styles'
import Fade from '@mui/material/Fade'
import { ReactElement, useEffect, useState } from 'react'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import StepHeader from '@core/journeys/ui/StepHeader'
import StepFooter from '@core/journeys/ui/StepFooter'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  useEditor,
  ActiveFab,
  ActiveTab
} from '@core/journeys/ui/EditorProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FramePortal } from '../../FramePortal'
import { DRAWER_WIDTH } from '../Drawer'
import 'swiper/swiper.min.css'
import { ThemeName, ThemeMode } from '../../../../__generated__/globalTypes'
import { NextCard } from '../ControlPanel/Attributes/blocks/Step/NextCard'
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
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

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
        paddingY: 3,
        '& .swiper-container': {
          paddingX: 6
        },
        '& .swiper-slide': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}
      onClick={() => {
        // Prevent losing focus on empty input
        if (
          selectedBlock?.__typename === 'TypographyBlock' &&
          selectedBlock.content === ''
        ) {
          return
        }
        dispatch({
          type: 'SetSelectedBlockAction',
          block: selectedStep
        })
        dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetDrawerPropsAction',
          title: 'Next Card Properties',
          mobileOpen: true,
          children: <NextCard />
        })
      }}
    >
      <Swiper
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        centeredSlides
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
                  outline: (theme) =>
                    step.parentOrder === swiper?.activeIndex
                      ? step.id === selectedBlock?.id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `2px solid ${theme.palette.background.default}`
                      : `0px solid`,
                  outlineOffset: 4,
                  transform:
                    step.id === selectedStep?.id
                      ? 'scale(0.95)'
                      : 'scaleY(0.9)',
                  height: 640
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
                <FramePortal width={360} height={640} dir={rtl ? 'rtl' : 'ltr'}>
                  <ThemeProvider
                    themeName={journey?.themeName ?? ThemeName.base}
                    themeMode={journey?.themeMode ?? ThemeMode.light}
                    rtl={rtl}
                    locale={locale}
                  >
                    <Fade
                      in={selectedStep?.id === step.id}
                      mountOnEnter
                      unmountOnExit
                    >
                      <Stack
                        justifyContent="center"
                        sx={{ width: '100%', height: '100%' }}
                      >
                        <StepHeader block={step} />
                        <BlockRenderer
                          block={step}
                          wrappers={{
                            Wrapper: SelectableWrapper,
                            TypographyWrapper: InlineEditWrapper,
                            ButtonWrapper: InlineEditWrapper,
                            RadioQuestionWrapper: InlineEditWrapper,
                            RadioOptionWrapper: InlineEditWrapper,
                            TextResponseWrapper: InlineEditWrapper,
                            SignUpWrapper: InlineEditWrapper,
                            VideoWrapper,
                            CardWrapper
                          }}
                        />
                        <StepFooter block={step} />
                      </Stack>
                    </Fade>
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
