import Box from '@mui/material/Box'
import Fab from '@mui/material/Fab'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { type ReactElement, useEffect, useRef, useState } from 'react'

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
import SettingsIcon from '@core/shared/ui/icons/Settings'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle
} from '../../../../Drawer'
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

const snapPoints = ['148px', '355px', 1]

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
  const [snap, setSnap] = useState<number | string | null>(snapPoints[0])
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900)
  const { t } = useTranslation('apps-journeys-admin')

  const [scale, setScale] = useState(1)
  // const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true)

  useEffect(() => {
    const handleResize = (): void => {
      const current = containerRef.current
      if (current == null) {
        setScale(1)
        return
      }

      setIsMobile(window.innerWidth <= 900)

      if (isMobile) {
        // On mobile, scale based on available width with padding
        const availableWidth = current.clientWidth - 48 // 24px padding on each side
        const widthScale = availableWidth / CARD_WIDTH
        // Also consider available height for mobile
        const availableHeight = current.clientHeight - 200 // Reserve space for header and footer
        const heightScale = availableHeight / CARD_HEIGHT
        const mobileScale = Math.min(widthScale, heightScale, 0.85) // Cap at 0.85 for mobile
        setScale(Math.max(mobileScale, 0.85))
      } else {
        // On desktop, use the original height-based calculation
        const newScale = calculateScale(containerRef)
        setScale(newScale > 0 ? newScale : 1)
      }
    }

    // Use setTimeout to ensure DOM is ready
    const timeoutId = setTimeout(handleResize, 100)

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMobile])

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
        alignItems: { xs: 'center', md: 'center' },
        alignSelf: 'center',
        justifyContent: 'center',
        flexGrow: { xs: 1, md: activeSlide === ActiveSlide.Content ? 1 : 0 },
        width: '100%'
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
            pb: { xs: 4, md: 0 },
            px: { xs: 3, md: 5 },
            justifyContent: { xs: 'space-between', md: 'center' },
            pt: { xs: 6, md: 0 },
            width: { xs: '100%', md: 'auto' }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flex: 1
            }}
          >
            <Box
              data-testId="CanvasContainer"
              className={`
              relative animate-in fade-in duration-500 ease-in-out
              transition-outline duration-200 delay-100 ease-out
              rounded-lg
              ${showAnalytics === true ? 'pointer-events-none' : 'pointer-events-auto'}
              ${selectedStep.id === selectedBlock?.id ? 'outline outline-2 outline-primary outline-offset-4' : ''}
            `}
              sx={{
                maxHeight: { xs: 'none', md: CARD_HEIGHT },
                width: CARD_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: {
                  xs: 'center',
                  md:
                    activeSlide === ActiveSlide.JourneyFlow ? 'right' : 'center'
                },
                my: {
                  xs: 0,
                  md: `${calculateScaledMargin(CARD_HEIGHT, scale)}`
                },
                mx: {
                  xs: 'auto',
                  md: `${calculateScaledMargin(CARD_WIDTH, scale)}`
                },
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
                scrolling="no"
              >
                {({ document }) => (
                  <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                    <Hotkeys document={document} />
                    <Box
                      className="relative m-3"
                      sx={{
                        width: 'calc(100% - 24px)',
                        height: 'calc(100vh - 24px)'
                      }}
                    >
                      <Stack
                        key={selectedStep.id}
                        justifyContent="center"
                        className="absolute inset-0 animate-in fade-in duration-300 ease-in-out"
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
                    </Box>
                  </ThemeProvider>
                )}
              </FramePortal>
            </Box>
          </Box>
          {/* Desktop footer */}
          {!isMobile && <CanvasFooter scale={scale} />}
        </Stack>
      )}

      {isMobile && (
        <>
          {/* Mobile settings drawer */}

          <Drawer
            open={true}
            // onOpenChange={setMobileDrawerOpen}
            direction="bottom"
            data-testid="CanvasSettingsDrawer"
            snapPoints={snapPoints}
            activeSnapPoint={snap}
            setActiveSnapPoint={setSnap}
            modal={false}
          >
            <DrawerContent className="fixed bottom-0 left-0 right-0 z-50">
              <DrawerHeader>
                <DrawerTitle>{t('Canvas Settings')}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <CanvasFooter scale={1} />
              </div>
            </DrawerContent>
          </Drawer>
          {/* Mobile floating action button */}
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000
            }}
            // onClick={() => setMobileDrawerOpen(true)}
          >
            <SettingsIcon />
          </Fab>
        </>
      )}
    </Stack>
  )
}
