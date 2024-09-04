import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { type ReactElement, useEffect, useRef, useState } from 'react'
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
import { ThemeName } from '@core/shared/ui/themes'

import { Hotkeys } from '../../../Hotkeys'

import { CanvasFooter } from './CanvasFooter'
import { CardWrapper } from './CardWrapper'
import { FormWrapper } from './FormWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  calculateScale,
  calculateScaledHeight,
  calculateScaledMargin
} from './utils/calculateDimensions'

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
      showAnalytics,
      importedSteps
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

  function handleFooterClick(): void {
    dispatch({
      type: 'SetActiveCanvasDetailsDrawerAction',
      activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Footer
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
    if (importedSteps != null) return
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
          gap={1.5}
          sx={{
            flexGrow: { xs: 1, md: 0 },
            height: { xs: '100%', md: 'auto' },
            pb: { xs: 5, md: 0 },
            px: { xs: 3, md: 0 },
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: `${calculateScaledHeight(CARD_HEIGHT, scale)}`
            }}
          >
            <Box
              data-testId="CanvasContainer"
              sx={{
                position: 'relative',
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                transform: `scale(${scale})`,
                margin: `calc(${calculateScaledMargin(CARD_HEIGHT, scale)} + ${
                  scale < 0.65 ? '20px' : '0px'
                }) ${calculateScaledMargin(CARD_WIDTH, scale)}`,
                borderRadius: 6,
                pointerEvents:
                  showAnalytics === true || importedSteps != null
                    ? 'none'
                    : 'auto',
                transition: (theme) =>
                  theme.transitions.create('border-color', {
                    duration: 200,
                    delay: 100,
                    easing: 'ease-out'
                  }),
                border: (theme) =>
                  selectedStep.id === selectedBlock?.id
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px solid ${theme.palette.background.default}`
              }}
            >
              <FramePortal
                width="100%"
                height="100%"
                dir={rtl ? 'rtl' : 'ltr'}
                // frameRef assists to see if user is copying text from typog blocks
                ref={frameRef}
              >
                {({ document }) => (
                  <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                    <Hotkeys document={document} />
                    <TransitionGroup
                      component={Box}
                      sx={{
                        backgroundColor: 'background.default',
                        borderRadius: 5,
                        '& .card-enter': {
                          zIndex: 1,
                          opacity: 0
                        },
                        '& .card-enter-active': {
                          zIndex: 1,
                          opacity: 1
                        },
                        '& .card-enter-done': {
                          zIndex: 1,
                          opacity: 1
                        },
                        '& .card-exit': {
                          zIndex: 0,
                          opacity: 1
                        },
                        '& .card-exit-active': {
                          opacity: 1,
                          zIndex: 0
                        },
                        position: 'relative',
                        width: 'calc(100% - 8px)',
                        height: 'calc(100vh - 8px)',
                        m: '4px'
                      }}
                    >
                      <CSSTransition
                        key={selectedStep.id}
                        timeout={300}
                        classNames="card"
                      >
                        <Stack
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
                                    ActiveCanvasDetailsDrawer.Footer &&
                                  journey?.website === true
                                    ? '2px solid #C52D3A'
                                    : 'none',
                                outlineOffset: -4,
                                borderRadius: 5,
                                cursor: 'pointer',
                                minHeight: '42px'
                              }}
                              onHeaderClick={
                                journey?.website === true
                                  ? handleFooterClick
                                  : undefined
                              }
                            />
                          </ThemeProvider>
                          <BlockRenderer
                            block={selectedStep}
                            wrappers={{
                              Wrapper: SelectableWrapper,
                              TypographyWrapper: InlineEditWrapper,
                              ButtonWrapper: InlineEditWrapper,
                              RadioQuestionWrapper: InlineEditWrapper,
                              RadioOptionWrapper: InlineEditWrapper,
                              TextResponseWrapper: InlineEditWrapper,
                              SignUpWrapper: InlineEditWrapper,
                              VideoWrapper,
                              CardWrapper,
                              FormWrapper
                            }}
                          />
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
                                  ActiveCanvasDetailsDrawer.Footer
                                    ? '2px solid #C52D3A'
                                    : 'none',
                                outlineOffset: -4,
                                borderRadius: 5,
                                cursor: 'pointer'
                              }}
                              onFooterClick={handleFooterClick}
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
          </Box>
        </Stack>
      )}
    </Stack>
  )
}
