import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SwiperCore from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/react'

import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { FramePortal } from '../../FramePortal'
import { Properties } from '../../JourneyView/Properties'
import { CardTemplateDrawer } from '../CardTemplateDrawer'
import { HostSidePanel } from '../ControlPanel/Attributes/blocks/Footer/HostSidePanel'
import { NextCard } from '../ControlPanel/Attributes/blocks/Step/NextCard'
import { DRAWER_WIDTH } from '../Drawer'

import { CardWrapper } from './CardWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'

import 'swiper/css'

const EDGE_SLIDE_WIDTH = 24
const MIN_SPACE_BETWEEN = 16
const TASKBAR_WIDTH = 72

export function Canvas(): ReactElement {
  const [swiper, setSwiper] = useState<SwiperCore>()
  const [spaceBetween, setSpaceBetween] = useState(16)
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const {
    state: { steps, selectedStep, selectedBlock, selectedComponent },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { editableStepFooter } = useFlags()
  const { t } = useTranslation('apps-journeys-admin')

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

  function handleClick(): void {
    // Prevent losing focus on empty input
    if (
      selectedBlock?.__typename === 'TypographyBlock' &&
      selectedBlock.content === ''
    )
      return
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
      title: t('Next Card Properties'),
      mobileOpen: true,
      children: <NextCard />
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${selectedStep?.id ?? ''}-next-block`
    })
  }

  function handleSlideChange(swiper: SwiperCore): void {
    const step = steps?.[swiper.activeIndex]
    if (step == null || step.id === selectedStep?.id) return
    dispatch({ type: 'SetActiveTabAction', activeTab: ActiveTab.Journey })
    // this is mirrored in the editor control panel handleSelectStepPreview fn
    dispatch({ type: 'SetSelectedStepAction', step })
    dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
    if (step.children[0].children.length === 0) {
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        id: undefined
      })
      dispatch({
        type: 'SetDrawerPropsAction',
        mobileOpen: false,
        title: t('Card Templates'),
        children: <CardTemplateDrawer />
      })
    } else {
      dispatch({
        type: 'SetDrawerPropsAction',
        mobileOpen: false,
        title: t('Properties'),
        children: <Properties journeyType="Journey" isPublisher={false} />
      })
    }
  }

  function handleFooterClick(): void {
    if (editableStepFooter) {
      dispatch({
        type: 'SetSelectedComponentAction',
        component: 'Footer'
      })
      dispatch({
        type: 'SetActiveFabAction',
        activeFab: ActiveFab.Add
      })
      dispatch({
        type: 'SetActiveTabAction',
        activeTab: ActiveTab.Properties
      })
      dispatch({
        type: 'SetDrawerPropsAction',
        title: t('Hosted By'),
        mobileOpen: true,
        children: <HostSidePanel />
      })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        id: 'hosted-by'
      })
    }
  }

  return (
    <Box
      sx={{
        backgroundColor: (theme) => theme.palette.background.paper,
        '& .swiper-container': {
          paddingX: 6,
          paddingY: 2
        },
        '& .swiper-slide': {
          display: 'flex',
          justifyContent: 'center'
        }
      }}
      onClick={handleClick}
    >
      <Swiper
        slidesPerView="auto"
        spaceBetween={spaceBetween}
        centeredSlides
        shortSwipes={false}
        slideToClickedSlide={steps != null}
        onSwiper={(swiper) => setSwiper(swiper)}
        onSlideChange={handleSlideChange}
      >
        {steps != null ? (
          steps.map((step) => {
            const theme = getStepTheme(step, journey)
            return (
              <SwiperSlide key={step.id} style={{ width: 362 }}>
                <Box
                  data-testid={`step-${step.id}`}
                  sx={{
                    borderRadius: 5,
                    transition: '0.2s all ease-out 0.1s',
                    position: 'relative',
                    overflow: 'hidden',
                    outline: (theme) =>
                      step.id === selectedStep?.id
                        ? step.id === selectedBlock?.id
                          ? `2px solid ${theme.palette.primary.main}`
                          : `2px solid ${theme.palette.background.default}`
                        : `0px solid`,
                    outlineOffset: 4,
                    transform:
                      step.id === selectedStep?.id
                        ? { xs: 'scale(0.9)', lg: 'scale(1)' }
                        : { xs: 'scale(0.8)', lg: 'scale(0.9)' },
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
                  <FramePortal
                    width={360}
                    height={640}
                    dir={rtl ? 'rtl' : 'ltr'}
                  >
                    <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                      <Fade
                        in={selectedStep?.id === step.id}
                        mountOnEnter
                        unmountOnExit
                      >
                        <Stack
                          justifyContent="center"
                          sx={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 5
                          }}
                        >
                          <StepHeader />
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
                          <StepFooter
                            sx={{
                              outline:
                                selectedComponent === 'Footer'
                                  ? '2px solid #C52D3A'
                                  : 'none',
                              outlineOffset: -4,
                              borderRadius: 5,
                              cursor: 'pointer'
                            }}
                            onFooterClick={handleFooterClick}
                          />
                        </Stack>
                      </Fade>
                    </ThemeProvider>
                  </FramePortal>
                </Box>
              </SwiperSlide>
            )
          })
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
