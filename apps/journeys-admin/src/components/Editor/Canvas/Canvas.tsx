import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useRef } from 'react'
import { useTranslation } from 'react-i18next'

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
import { ThemeName } from '@core/shared/ui/themes'

import { setBeaconPageViewed } from '../../../libs/setBeaconPageViewed'
import { FramePortal } from '../../FramePortal'

import { CardWrapper } from './CardWrapper'
import { FormWrapper } from './FormWrapper'
import { InlineEditWrapper } from './InlineEditWrapper'
import { SelectableWrapper } from './SelectableWrapper'
import { VideoWrapper } from './VideoWrapper'

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
    state: { selectedStep, selectedBlock, selectedComponent },
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

  const theme =
    selectedStep != null ? getStepTheme(selectedStep, journey) : null

  return (
    <Box
      onClick={handleSelectCard}
      onMouseDown={() => {
        // click target was the card component and not it's children blocks
        selectionRef.current = true
      }}
      data-testid="EditorCanvas"
      sx={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {selectedStep != null && theme != null && (
        <Box
          data-testid={`step-${selectedStep.id}`}
          sx={{
            width: '100%',
            maxWidth: 360,
            maxHeight: 640,
            aspectRatio: '9 / 16',
            boxSizing: 'border-box',
            position: 'relative',
            display: 'flex',
            borderRadius: 5,
            transition: '0.2s outline ease-out 0.1s',
            outline: (theme) =>
              selectedStep.id === selectedBlock?.id
                ? `2px solid ${theme.palette.primary.main}`
                : `2px solid ${theme.palette.background.default}`,
            outlineOffset: 5,
            transformOrigin: 'center',
            m: '16px'
          }}
        >
          <FramePortal
            width="100%"
            height="100%"
            dir={rtl ? 'rtl' : 'ltr'}
            ref={frameRef}
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
      )}
    </Box>
  )
}
