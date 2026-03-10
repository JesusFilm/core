import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useUser } from 'next-firebase-auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import {
  CUSTOMIZE_SCREEN_QUERY_KEY,
  buildCustomizeUrl,
  getActiveScreenFromQuery
} from '../utils/customizationRoutes'
import {
  CustomizationScreen,
  getCustomizeFlowConfig
} from '../utils/getCustomizeFlowConfig'
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
  handleNext: (overrideJourneyId?: string) => void
): ReactElement {
  switch (screen) {
    case 'language':
      return <LanguageScreen handleNext={handleNext} />
    case 'text':
      return <TextScreen handleNext={handleNext} />
    case 'guestPreview':
      return (
        <GuestPreviewScreen handleScreenNavigation={handleScreenNavigation} />
      )
      return <LinksScreen handleNext={handleNext} />
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
  const user = useUser()
  const { journey } = useJourney()
  const { customizableMedia, templateCustomizationGuestFlow } = useFlags()

  const firebaseUserLoaded = user?.firebaseUser != null
  const isAnon = user?.firebaseUser?.isAnonymous ?? false
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
        customizableMedia: customizableMedia ?? false
      }),
    [journey, t, customizableMedia]
  )

  const activeScreen = getActiveScreenFromQuery(
    router.query[CUSTOMIZE_SCREEN_QUERY_KEY],
    screens
  )

  useTemplateCustomizationRedirect({
    journeyId,
    screens,
    activeScreen,
    isGuest: firebaseUserLoaded && isAnon,
    guestFlowEnabled: templateCustomizationGuestFlow === true
  })

  async function handleNext(overrideJourneyId?: string): Promise<void> {
    const targetJourneyId =
      typeof overrideJourneyId === 'string' ? overrideJourneyId : journeyId
    const currentIndex = screens.indexOf(activeScreen)
    const isLastOrInvalidScreen =
      currentIndex < 0 || currentIndex >= screens.length - 1
    if (isLastOrInvalidScreen) return
    void router.replace(
      buildCustomizeUrl(targetJourneyId, screens[currentIndex + 1], undefined)
    )
  }

  async function handleScreenNavigation(
    screen: CustomizationScreen
  ): Promise<void> {
    void router.replace(buildCustomizeUrl(journeyId, screen, undefined))
  }

  const activeStepForStepper =
    activeScreen === 'guestPreview'
      ? screens.indexOf('guestPreview') - 1
      : screens.indexOf(activeScreen)

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
          py: 10,
          overflow: 'hidden'
        }}
      >
        <Stack gap={{ xs: 8, sm: 17 }} data-testid="MultiStepForm">
          {(hasEditableText ||
            hasCustomizableLinks ||
            hasCustomizableMedia) && (
            <Box sx={{ mt: { xs: 3, sm: 6 } }}>
              <ProgressStepper
                activeStepNumber={activeStepForStepper}
                totalSteps={totalSteps}
              />
            </Box>
          )}
          {renderScreen(activeScreen, handleNext)}
        </Stack>
      </Container>
    </TemplateVideoUploadProvider>
  )
}
