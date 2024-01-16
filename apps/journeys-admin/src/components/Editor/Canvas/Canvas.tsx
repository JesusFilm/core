import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement } from 'react'
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
  const router = useRouter()
  const {
    state: { selectedStep, selectedBlock, selectedComponent },
    dispatch
  } = useEditor()
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const { t } = useTranslation('apps-journeys-admin')

  function handleSelectCard(): void {
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
      title: t('Next Card Properties'),
      mobileOpen: true,
      children: <NextCard />
    })
    dispatch({
      type: 'SetSelectedAttributeIdAction',
      id: `${selectedStep?.id ?? ''}-next-block`
    })
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
    <Box
      onClick={handleSelectCard}
      data-testid="EditorCanvas"
      sx={{
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {selectedStep != null && (
        <Box
          data-testid={`step-${selectedStep.id}`}
          sx={{
            height: 'calc(100% - 32px)',
            aspectRatio: '9 / 16',
            maxWidth: 360,
            maxHeight: 640,
            display: 'flex'
          }}
        >
          <FramePortal
            width="100%"
            height="100%"
            sx={{
              transform: {
                xs: 'scale(0.85)',
                sm: 'scale(0.9)',
                md: 'scale(0.95)'
              },
              transition: '0.2s outline ease-out 0.1s',
              borderRadius: 5,
              outline: (theme) =>
                selectedStep.id === selectedBlock?.id
                  ? `2px solid ${theme.palette.primary.main}`
                  : `2px solid ${theme.palette.background.default}`,
              outlineOffset: 4
            }}
            dir={rtl ? 'rtl' : 'ltr'}
          >
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
      )}
    </Box>
  )
}
