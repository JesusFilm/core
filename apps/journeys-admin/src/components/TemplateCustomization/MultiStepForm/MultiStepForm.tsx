import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

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
  getCustomizeFlowConfig
} from '../utils/getCustomizeFlowConfig'
import { getNextCustomizeScreen } from '../utils/getNextCustomizeScreen'
import { useTemplateCustomizationRedirect } from '../utils/useTemplateCustomizationRedirect'

import { ProgressStepper } from './ProgressStepper'
import {
  DoneScreen,
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
      // TODO: move screens to guest preview screen when available
      return <LinksScreen screens={screens} handleNext={handleNext} />
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
  const { user } = useAuth()
  const { journey } = useJourney()
  const { customizableMedia, templateCustomizationGuestFlow } = useFlags()

  const isAnon = user?.isAnonymous ?? false
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
    isGuest: isAnon,
    guestFlowEnabled: templateCustomizationGuestFlow === true
  })

  async function handleNext(overrideJourneyId?: string): Promise<void> {
    const targetJourneyId =
      typeof overrideJourneyId === 'string' ? overrideJourneyId : journeyId
    const nextScreen = getNextCustomizeScreen(screens, activeScreen)
    if (nextScreen == null) return
    void router.replace(
      buildCustomizeUrl(targetJourneyId, nextScreen, undefined)
    )
  }

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
                activeStepNumber={screens.indexOf(activeScreen)}
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
