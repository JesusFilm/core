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
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { StepFooter } from '@core/journeys/ui/StepFooter'
import { StepHeader } from '@core/journeys/ui/StepHeader'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { setBeaconPageViewed } from '../../../../libs/setBeaconPageViewed'
import { FramePortal } from '../../../FramePortal'
import { CardWrapper } from '../CardWrapper'
import { FormWrapper } from '../FormWrapper'
import { InlineEditWrapper } from '../InlineEditWrapper'
import { SelectableWrapper } from '../SelectableWrapper'
import { VideoWrapper } from '../VideoWrapper'

const HostSidePanel = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "HostSidePanel" */ '../../Drawer/Attributes/blocks/Footer/HostSidePanel'
    ).then((mod) => mod.HostSidePanel),
  { ssr: false }
)

export function ScaledCard({ selectedStep, theme }): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const router = useRouter()
  const {
    state: { selectedComponent },
    dispatch
  } = useEditor()

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

  return (
    <FramePortal width="100%" height="100%" dir={rtl ? 'rtl' : 'ltr'}>
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
                  selectedComponent === 'Footer' ? '2px solid #C52D3A' : 'none',
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
  )
}
