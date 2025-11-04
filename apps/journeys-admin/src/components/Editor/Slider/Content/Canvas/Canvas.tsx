import { keyframes } from '@emotion/react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { Hotkeys } from '../../../Hotkeys'

import { CanvasFooter } from './CanvasFooter'
import { CardWrapper } from './CardWrapper'
import { DragDropWrapper } from './DragDropWrapper'
import { DragItemWrapper } from './DragItemWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { JourneyLocaleProvider } from './JourneyLocaleProvider'
import { SelectableWrapper } from './SelectableWrapper'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  calculateScale,
  calculateScaledMargin
} from './utils/calculateDimensions'

const fadeIn = keyframes`
  from {
    top: -10px;
    opacity: 0;
  }
  to {
    top: 0;
    opacity: 1;
  }
`

export function Canvas(): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // this ref handles if the mouseDown event of the onClick event's target is the card component
  const selectionRef = useRef(false)
  const {
    state: {
      selectedStep,
      selectedBlock,
      activeSlide,
      activeCanvasDetailsDrawer,
      showAnalytics
    },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const router = useRouter()

  const initialScale =
    typeof window !== 'undefined' && window.innerWidth <= 600 ? 0 : 1
  const [scale, setScale] = useState(initialScale)

  useEffect(() => {
    const handleResize = (): void => setScale(calculateScale(containerRef))
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleJourneyAppearanceClick(): void {
    dispatch({
      type: 'SetActiveCanvasDetailsDrawerAction',
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.JourneyAppearance
    })
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: undefined
    })
    const param = 'step-footer'
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  function handleSelectCard(): void {
    if (showAnalytics === true) return
    const iframeDocument =
      frameRef.current?.contentDocument ??
      frameRef.current?.contentWindow?.document

    const selectedText = iframeDocument?.getSelection()?.toString()

    // if user is copying from typog blocks or text, keep focus on typog blocks
    if (selectedText != null && selectedText !== '' && !selectionRef.current) {
      return
    }
    // Prevent losing focus on empty input
    if (
      selectedBlock?.__typename === 'TypographyBlock' &&
      selectedBlock.content === ''
    ) {
      resetClickOrigin()
      return
    }
    dispatch({
      type: 'SetSelectedBlockAction',
      selectedBlock: selectedStep
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
    })
    resetClickOrigin()
  }

  function resetClickOrigin(): void {
    selectionRef.current = false
  }

  const theme =
    selectedStep != null ? getStepTheme(selectedStep, journey) : null

  const journeyTheme = journey?.journeyTheme
  const fontFamilies = useMemo(() => {
    if (journeyTheme == null) return

    return {
      headerFont: journeyTheme?.headerFont ?? '',
      bodyFont: journeyTheme?.bodyFont ?? '',
      labelFont: journeyTheme?.labelFont ?? ''
    }
  }, [journeyTheme])

  const nodeRef = useRef(null)

  return (
    <Stack
      ref={containerRef}
      className="EditorCanvas"
      onClick={handleSelectCard}
      onMouseDown={() => {
        // click target was the card component and not it's children blocks
        selectionRef.current = true
      }}
      data-testid="EditorCanvas"
      direction="row"
      alignItems="flex-end"
      sx={{
        height: '100%',
        alignItems: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        flexGrow: { xs: 1, md: activeSlide === ActiveSlide.Content ? 1 : 0 },
        transition: (theme) =>
          theme.transitions.create('flex-grow', { duration: 300 })
      }}
    >
      {selectedStep != null && theme != null && (
        <Stack
          direction="column"
          className="CanvasStack"
          alignItems={{ xs: 'center', md: 'flex-end' }}
          gap={{ xs: 0, sm: 1.5 }}
          sx={{
            flexGrow: { xs: 1, md: 0 },
            height: { xs: '100%', md: 'auto' },
            pb: { xs: 5, md: 0 },
            px: { xs: 3, md: 5 },
            justifyContent: 'center'
          }}
        >
          <Box
            data-testId="CanvasContainer"
            sx={{
              animation: (theme) =>
                `${fadeIn} ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut} 0.5s backwards`,
              position: 'relative',
              maxHeight: CARD_HEIGHT,
              width: CARD_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: {
                xs: 'center',
                md: activeSlide === ActiveSlide.JourneyFlow ? 'right' : 'center'
              },
              my: `${calculateScaledMargin(CARD_HEIGHT, scale)}`,
              mx: `${calculateScaledMargin(CARD_WIDTH, scale)}`,
              borderRadius: 8,
              pointerEvents: showAnalytics === true ? 'none' : 'auto',
              transition: (theme) =>
                theme.transitions.create('outline', {
                  duration: 200,
                  delay: 100,
                  easing: 'ease-out'
                }),
              outline: (theme) =>
                selectedStep.id === selectedBlock?.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : 'none',
              outlineOffset: 4,
              bgcolor:
                theme.themeMode === ThemeMode.light
                  ? 'secondary.main'
                  : 'secondary.dark',
              aspectRatio: 6 / 13
            }}
          >
            <FramePortal
              height="100%"
              width="100%"
              dir={rtl ? 'rtl' : 'ltr'}
              // frameRef assists to see if user is copying text from typog blocks
              ref={frameRef}
              fontFamilies={fontFamilies}
              scrolling="no"
            >
              {({ document }) => (
                <ThemeProvider
                  {...theme}
                  rtl={rtl}
                  locale={locale}
                  fontFamilies={fontFamilies}
                >
                  <Hotkeys document={document} />
                  <TransitionGroup
                    component={Box}
                    sx={{
                      '& .card-enter': {
                        opacity: 0
                      },
                      '& .card-enter-active': {
                        opacity: 1,
                        transition: 'opacity 0.15s ease'
                      },
                      '& .card-exit': {
                        opacity: 1
                      },
                      '& .card-exit-active': {
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      position: 'relative',
                      width: 'calc(100% - 24px)',
                      height: 'calc(100vh - 24px)',
                      m: '12px'
                    }}
                  >
                    <CSSTransition
                      nodeRef={nodeRef}
                      key={selectedStep.id}
                      timeout={300}
                      classNames="card"
                    >
                      <Stack
                        ref={nodeRef}
                        justifyContent="center"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          bottom: 0,
                          left: 0,
                          transition: (theme) =>
                            theme.transitions.create('opacity')
                        }}
                        data-testid={`step-${selectedStep.id}`}
                      >
                        <ThemeProvider
                          themeName={ThemeName.journeyUi}
                          themeMode={theme.themeMode}
                          rtl={rtl}
                          locale={locale}
                          nested
                        >
                          <StepHeader
                            sx={{
                              outline:
                                activeCanvasDetailsDrawer ===
                                  ActiveCanvasDetailsDrawer.JourneyAppearance &&
                                journey?.website === true
                                  ? '2px solid #C52D3A'
                                  : 'none',
                              outlineOffset: -4,
                              borderRadius: 6,
                              cursor: 'pointer',
                              minHeight: '42px'
                            }}
                            onHeaderClick={
                              journey?.website === true
                                ? handleJourneyAppearanceClick
                                : undefined
                            }
                          />
                        </ThemeProvider>
                        <DragDropWrapper>
                          <JourneyLocaleProvider locale={locale}>
                            <BlockRenderer
                              block={selectedStep}
                              wrappers={{
                                Wrapper: SelectableWrapper,
                                TypographyWrapper: InlineEditWrapper,
                                ButtonWrapper: InlineEditWrapper,
                                RadioQuestionWrapper: InlineEditWrapper,
                                RadioOptionWrapper: InlineEditWrapper,
                                MultiselectQuestionWrapper: InlineEditWrapper,
                                MultiselectOptionWrapper: InlineEditWrapper,
                                TextResponseWrapper: InlineEditWrapper,
                                SignUpWrapper: InlineEditWrapper,
                                VideoWrapper,
                                CardWrapper,
                                DragItemWrapper
                              }}
                            />
                          </JourneyLocaleProvider>
                        </DragDropWrapper>
                        <ThemeProvider
                          themeName={ThemeName.journeyUi}
                          themeMode={theme.themeMode}
                          rtl={rtl}
                          locale={locale}
                          nested
                        >
                          <StepFooter
                            sx={{
                              outline:
                                activeCanvasDetailsDrawer ===
                                ActiveCanvasDetailsDrawer.JourneyAppearance
                                  ? '2px solid #C52D3A'
                                  : 'none',
                              outlineOffset: -4,
                              borderRadius: 6,
                              cursor: 'pointer'
                            }}
                            onFooterClick={handleJourneyAppearanceClick}
                          />
                        </ThemeProvider>
                      </Stack>
                    </CSSTransition>
                  </TransitionGroup>
                </ThemeProvider>
              )}
            </FramePortal>
          </Box>
          <CanvasFooter scale={scale} />
        </Stack>
      )}
    </Stack>
  )
}
