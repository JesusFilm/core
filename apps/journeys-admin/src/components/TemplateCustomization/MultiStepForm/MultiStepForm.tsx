import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import { useAuth } from '../../../libs/auth'
import {
  CUSTOMIZE_SCREEN_QUERY_KEY,
  buildCustomizeUrl,
  getActiveScreenFromQuery
} from '../utils/customizationRoutes'
import {
  CustomizationScreen,
  STEPPER_EXCLUDED_SCREENS,
  STEPPER_HIDDEN_SCREENS,
  getCustomizeFlowConfig
} from '../utils/getCustomizeFlowConfig'
import { getNextCustomizeScreen } from '../utils/getNextCustomizeScreen'
import { useTemplateCustomizationRedirect } from '../utils/useTemplateCustomizationRedirect'

import { ProgressStepper } from './ProgressStepper'
import {
  DoneScreen,
  GuestPreviewScreen,
  LanguageScreen,
  LinksScreen,
  MediaScreen,
  SocialScreen,
  TextScreen
} from './Screens'
import { TemplateVideoUploadProvider } from './TemplateVideoUploadProvider'

export const MULTI_STEP_FORM_MIN_HEIGHT = 900

function renderScreen(
  screen: CustomizationScreen,
  screens: CustomizationScreen[],
  handleNext: (overrideJourneyId?: string) => void
): ReactElement {
  switch (screen) {
    case 'language':
      return <LanguageScreen handleNext={handleNext} />
    case 'text':
      return <TextScreen handleNext={handleNext} />
    case 'links':
      return <LinksScreen handleNext={handleNext} />
    case 'guestPreview':
      return <GuestPreviewScreen screens={screens} handleNext={handleNext} />
    case 'media':
      return <MediaScreen handleNext={handleNext} />
    case 'social':
      return <SocialScreen handleNext={handleNext} />
    case 'done':
      return <DoneScreen />
    default:
      return <></>
  }
}

export function MultiStepForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const router = useRouter()
  const { journey } = useJourney()
  const { customizableMedia, templateCustomizationGuestFlow } = useFlags()
  const { user } = useAuth()

  const isGuest = user == null || user.isAnonymous === true
  const journeyId = journey?.id ?? ''

  const {
    screens,
    totalSteps,
    hasEditableText,
    hasCustomizableLinks,
    hasCustomizableMedia
  } = useMemo(
    () =>
      getCustomizeFlowConfig(journey, t, {
        customizableMedia: customizableMedia ?? false,
        isGuest
      }),
    [journey, t, customizableMedia, isGuest]
  )

  const activeScreen = getActiveScreenFromQuery(
    router.query[CUSTOMIZE_SCREEN_QUERY_KEY],
    screens
  )

  // Reset scroll position when the active screen changes.
  useEffect(() => {
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="MainPanelBody"]')
        ?.scrollTo(0, 0)

      document
        .querySelector<HTMLElement>('[data-testid="JourneysAdminPageWrapper"]')
        ?.scrollTo(0, 0)
    })
  }, [activeScreen])

  useTemplateCustomizationRedirect({
    journeyId,
    screens,
    activeScreen,
    isGuest,
    guestFlowEnabled: templateCustomizationGuestFlow === true
  })

  async function handleNext(overrideJourneyId?: string): Promise<void> {
    const targetJourneyId =
      typeof overrideJourneyId === 'string' ? overrideJourneyId : journeyId
    const nextScreen = getNextCustomizeScreen(screens, activeScreen)
    if (nextScreen == null) return
    const success = await router.replace(
      buildCustomizeUrl(targetJourneyId, nextScreen, undefined)
    )
    if (!success) {
      throw new Error('Navigation was aborted')
    }
  }

  const stepperScreens = screens.filter((s) => !STEPPER_EXCLUDED_SCREENS.has(s))
  const activeScreenIndex = screens.indexOf(activeScreen)
  const activeStepForStepper = STEPPER_EXCLUDED_SCREENS.has(activeScreen)
    ? stepperScreens.indexOf(screens[activeScreenIndex - 1])
    : stepperScreens.indexOf(activeScreen)

  return (
    <TemplateVideoUploadProvider>
      <Container
        maxWidth="sm"
        disableGutters
        sx={{
          width: '100%',
          minHeight: { xs: '100%', sm: MULTI_STEP_FORM_MIN_HEIGHT },
          backgroundColor: 'background.paper',
          borderRadius: { xs: '0px', sm: '16px' },
          mt: { xs: 0, sm: 6 },
          mb: { xs: 0, sm: 6 },
          pt: { xs: '62px', sm: 10 },
          pb: 10,
          overflow: 'hidden'
        }}
      >
        <Stack gap={{ xs: 8, sm: 17 }} data-testid="MultiStepForm">
          {!STEPPER_HIDDEN_SCREENS.has(activeScreen) &&
            (hasEditableText ||
              hasCustomizableLinks ||
              hasCustomizableMedia) && (
              <Box sx={{ mt: { xs: 0, sm: 5 } }}>
                <ProgressStepper
                  activeStepNumber={activeStepForStepper}
                  totalSteps={totalSteps}
                />
              </Box>
            )}
          {renderScreen(activeScreen, screens, handleNext)}
        </Stack>
      </Container>
    </TemplateVideoUploadProvider>
  )
}
