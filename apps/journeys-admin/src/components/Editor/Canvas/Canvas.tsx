import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import {
  ActiveFab,
  ActiveTab,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../__generated__/GetJourney'
import { setBeaconPageViewed } from '../../../libs/setBeaconPageViewed'
import { FramePortal } from '../../FramePortal'

import { AddBlockToolbar } from './AddBlockToolbar'
import { CardWrapper } from './CardWrapper'
import { FormWrapper } from './FormWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'

const NextCard = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "NextCard" */ '../Drawer/Attributes/blocks/Step/NextCard'
    ).then((mod) => mod.NextCard),
  { ssr: false }
)

const HostSidePanel = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "HostSidePanel" */ '../Drawer/Attributes/blocks/Footer/HostSidePanel'
    ).then((mod) => mod.HostSidePanel),
  { ssr: false }
)

export function Canvas(): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  // this ref handles if the mouseDown event of the onClick event's target is the card component
  const selectionRef = useRef(false)
  const {
    state: { selectedStep, selectedBlock, activeSlide, selectedComponent },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { t } = useTranslation('apps-journeys-admin')
  const { rtl, locale } = getJourneyRTL(journey)
  const router = useRouter()

  function handleFooterClick(): void {
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
      id: undefined
    })

    router.query.param = 'step-footer'
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed('Step Footer')
    })
  }

  function handleSelectCard(): void {
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
      // reset click origin
      selectionRef.current = false
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
      title: t('Next Card Properties'),
      mobileOpen: true,
      children: <NextCard />
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${selectedStep?.id ?? ''}-next-block`
    })
    // reset click origin
    selectionRef.current = false
  }

  const theme =
    selectedStep != null ? getStepTheme(selectedStep, journey) : null

  const scale = useMemo(() => {
    if (containerRef.current != null) {
      return Math.min(
        containerRef.current?.clientWidth / 375,
        containerRef.current?.clientHeight / 670
      )
    }
    return 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current?.clientWidth, containerRef.current?.clientHeight])

  return (
    <Stack
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
        flexGrow: { xs: 1, sm: activeSlide === ActiveSlide.Canvas ? 1 : 0 },
        transition: (theme) =>
          theme.transitions.create('flex-grow', { duration: 300 })
      }}
    >
      {selectedStep != null && theme != null && (
        <Stack
          direction="row"
          alignItems="flex-end"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            height: { xs: '100%', sm: 'auto' },
            p: { xs: 3, sm: 0 },
            justifyContent: 'center'
          }}
        >
          {/* <Box
            sx={{
              width: {
                xs: 50,
                sm: activeSlide === ActiveSlide.Canvas ? 50 : 0
              },
              mr: { xs: 2, sm: activeSlide === ActiveSlide.Canvas ? 7 : 0 },
              transition: (theme) =>
                theme.transitions.create(['width', 'margin'], {
                  duration: 150
                }),
              overflow: 'hidden'
            }}
          >
            <QuickControls />
          </Box> */}
          <TransitionGroup
            component={Box}
            data-testid={`step-${selectedStep.id}`}
            sx={{
              '& .card-enter': {
                opacity: 0
              },
              '& .card-enter-active': {
                opacity: 1
              },
              '& .card-enter-done': {
                opacity: 1
              },
              '& .card-exit': {
                opacity: 1
              },
              '& .card-exit-active': {
                opacity: 0
              },
              width: { xs: '100%', sm: 387 },
              height: { xs: '100%', sm: 682 },
              display: 'flex'
            }}
          >
            <Box ref={containerRef}>
              <CSSTransition
                key={selectedStep.id}
                timeout={300}
                classNames="card"
              >
                <Box
                  sx={{
                    position: 'relative',
                    left: '50%',
                    top: '50%',
                    width: 375,
                    height: 670,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    borderRadius: 5,
                    transition: (theme) =>
                      theme.transitions.create('border-color', {
                        duration: 200,
                        delay: 100,
                        easing: 'ease-out'
                      }),
                    border: (theme) =>
                      selectedStep.id === selectedBlock?.id
                        ? `2px solid ${theme.palette.primary.main}`
                        : `2px solid ${theme.palette.background.default}`,
                    p: 1
                  }}
                >
                  <FramePortal
                    width="100%"
                    height="100%"
                    dir={rtl ? 'rtl' : 'ltr'}
                  >
                    <ThemeProvider {...theme} rtl={rtl} locale={locale}>
                      <Stack
                        justifyContent="center"
                        sx={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 5
                        }}
                      >
                        <ThemeProvider
                          themeName={ThemeName.journeyUi}
                          themeMode={theme.themeMode}
                          rtl={rtl}
                          locale={locale}
                          nested
                        >
                          <StepHeader />
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
                                selectedComponent === 'Footer'
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
                    </ThemeProvider>
                  </FramePortal>
                </Box>
              </CSSTransition>
            </Box>
          </TransitionGroup>
        </Stack>
      )}
    </Stack>
  )
}
