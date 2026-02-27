import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../../../libs/auth'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useFlags } from '@core/shared/ui/FlagsProvider'
import Edit3 from '@core/shared/ui/icons/Edit3'

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
  handleNext: (overrideJourneyId?: string) => void,
  handleScreenNavigation: (screen: CustomizationScreen) => void
): ReactElement {
  switch (screen) {
    case 'language':
      return (
        <LanguageScreen
          handleNext={handleNext}
          handleScreenNavigation={handleScreenNavigation}
        />
      )
    case 'text':
      return (
        <TextScreen
          handleNext={handleNext}
          handleScreenNavigation={handleScreenNavigation}
        />
      )
    case 'links':
      return (
        <LinksScreen
          handleNext={handleNext}
          handleScreenNavigation={handleScreenNavigation}
        />
      )
    case 'media':
      return <MediaScreen handleNext={handleNext} />
    case 'social':
      return (
        <SocialScreen
          handleNext={handleNext}
          handleScreenNavigation={handleScreenNavigation}
        />
      )
    case 'done':
      return <DoneScreen handleScreenNavigation={handleScreenNavigation} />
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

  const journeyId = journey?.id ?? ''
  const link = `/journeys/${journeyId}`

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
    isGuest: user?.id == null,
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

  return (
    <TemplateVideoUploadProvider>
      <Container
        maxWidth="sm"
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
        <Stack gap={{ xs: 6, sm: 6 }} data-testid="MultiStepForm">
          <NextLink href={link} passHref legacyBehavior>
            <Button
              variant="text"
              color="primary"
              startIcon={<Edit3 />}
              sx={{
                alignSelf: 'flex-end',
                mr: '4px',
                fontWeight: 'bold',
                visibility: activeScreen === 'language' ? 'hidden' : 'visible',
                '& .MuiButton-startIcon': {
                  marginRight: 0.3,
                  marginTop: 1
                }
              }}
              disabled={journey?.id == null}
            >
              {t('Edit Manually')}
            </Button>
          </NextLink>
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

          <Box
            sx={{
              alignSelf: 'center',
              width: '100%',
              px: '14px',
              py: { xs: '10px', sm: '24px' }
            }}
          >
            {renderScreen(activeScreen, handleNext, handleScreenNavigation)}
          </Box>
        </Stack>
      </Container>
    </TemplateVideoUploadProvider>
  )
}
