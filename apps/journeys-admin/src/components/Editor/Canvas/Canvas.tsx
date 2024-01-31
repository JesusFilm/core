import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

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
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { setBeaconPageViewed } from '../../../libs/setBeaconPageViewed'
import { FramePortal } from '../../FramePortal'

import { CardWrapper } from './CardWrapper'
import { FormWrapper } from './FormWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { QuickControls } from './QuickControls'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { AddBlockToolbar } from './AddBlockToolbar'
import Card from '@mui/material/Card'

const NextCard = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "NextCard" */ '../ControlPanel/Attributes/blocks/Step/NextCard'
    ).then((mod) => mod.NextCard),
  { ssr: false }
)

const HostSidePanel = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "HostSidePanel" */ '../ControlPanel/Attributes/blocks/Footer/HostSidePanel'
    ).then((mod) => mod.HostSidePanel),
  { ssr: false }
)

export function Canvas(): ReactElement {
  const frameRef = useRef<HTMLIFrameElement>(null)
  // this ref handles if the mouseDown event of the onClick event's target is the card component
  const selectionRef = useRef(false)
  const router = useRouter()
  const {
    state: { selectedStep, selectedBlock, selectedComponent, activeSlide },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')

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
      id: 'hosted-by'
    })

    router.query.param = 'step-footer'
    void router.push(router)
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed('Step Footer')
    })
  }

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
    >
      <Box
        sx={{
          width: activeSlide === ActiveSlide.Canvas ? 50 : 0,
          mr: activeSlide === ActiveSlide.Canvas ? 4 : 0,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              duration: 150
            }),
          overflow: 'hidden'
        }}
      >
        <QuickControls />
      </Box>
      {selectedStep != null && (
        <TransitionGroup
          component={Box}
          sx={{
            width: 360,
            height: 640,
            position: 'relative',
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
            }
          }}
        >
          <CSSTransition key={selectedStep.id} timeout={300} classNames="card">
            <Box
              data-testid={`step-${selectedStep.id}`}
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                display: 'flex',
                borderRadius: 5,
                transition: (theme) =>
                  `${theme.transitions.create('opacity', {
                    duration: 300
                  })}, ${theme.transitions.create('outline', {
                    duration: 200,
                    delay: 100,
                    easing: 'ease-out'
                  })}`,
                outline: (theme) =>
                  selectedStep.id === selectedBlock?.id
                    ? `2px solid ${theme.palette.primary.main}`
                    : `2px solid ${theme.palette.background.default}`,
                outlineOffset: 4
              }}
            >
              <FramePortal width="100%" height="100%" dir={rtl ? 'rtl' : 'ltr'}>
                <ThemeProvider
                  {...getStepTheme(selectedStep, journey)}
                  rtl={rtl}
                  locale={locale}
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
                </ThemeProvider>
              </FramePortal>
            </Box>
          </CSSTransition>
        </TransitionGroup>
      )}
      <Box
        sx={{
          width: activeSlide === ActiveSlide.Canvas ? 53 : 0,
          ml: activeSlide === ActiveSlide.Canvas ? 7 : 0,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              duration: 150
            }),
          overflow: 'hidden'
        }}
      >
        <Card
          variant="outlined"
          sx={{
            borderRadius: 2,
            my: '89px'
          }}
        >
          <AddBlockToolbar />
        </Card>
      </Box>
    </Stack>
  )
}
