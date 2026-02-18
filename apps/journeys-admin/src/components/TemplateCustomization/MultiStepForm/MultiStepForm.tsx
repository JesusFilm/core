import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import { useUser } from 'next-firebase-auth'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { useSnackbar } from 'notistack'
import { ReactElement, useCallback, useEffect, useMemo } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit3 from '@core/shared/ui/icons/Edit3'
import { useFlags } from '@core/shared/ui/FlagsProvider'

import {
  buildCustomizeUrl,
  getActiveScreenFromQuery,
  getFirstGuestAllowedScreen,
  isScreenAllowedForGuest,
  CUSTOMIZE_SCREEN_QUERY_KEY
} from '../utils/customizationRoutes'
import {
  CustomizationScreen,
  getCustomizeFlowConfig
} from '../utils/getCustomizeFlowConfig'

import { ProgressStepper } from './ProgressStepper'
import {
  DoneScreen,
  LanguageScreen,
  LinksScreen,
  SocialScreen,
  TextScreen
} from './Screens'

export const MULTI_STEP_FORM_MIN_HEIGHT = 900

function renderScreen(
  screen: CustomizationScreen,
  handleNext: () => void,
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
  const { enqueueSnackbar } = useSnackbar()
  const user = useUser()
  const { journey } = useJourney()
  const { templateCustomizationGuestFlow } = useFlags()

  const { screens, totalSteps, hasEditableText, hasCustomizableLinks } =
    useMemo(() => getCustomizeFlowConfig(journey, t), [])

  const journeyId = router.query.journeyId as string
  const activeScreen = getActiveScreenFromQuery(
    router.query[CUSTOMIZE_SCREEN_QUERY_KEY],
    screens
  )

  const onTemplatesRedirect = useCallback(() => {
    enqueueSnackbar(t('Journey not found. Redirected to templates.'), {
      variant: 'error',
      preventDuplicate: true
    })
  }, [enqueueSnackbar, t])

  useEffect(() => {
    if (!router.isReady || !journeyId || screens.length === 0) return
    const screenQuery = router.query[CUSTOMIZE_SCREEN_QUERY_KEY]
    const rawScreen =
      typeof screenQuery === 'string'
        ? screenQuery
        : Array.isArray(screenQuery)
          ? screenQuery[0]
          : undefined

    const isMissingScreen = rawScreen == null || rawScreen === ''
    const isInvalidScreen =
      rawScreen != null && !screens.includes(rawScreen as CustomizationScreen)

    if (isMissingScreen || isInvalidScreen) {
      enqueueSnackbar(
        t('Invalid customization step. You have been redirected to the first step.'),
        { variant: 'error', preventDuplicate: true }
      )
      router.replace(
        buildCustomizeUrl(journeyId, screens[0], undefined, onTemplatesRedirect)
      )
    }
  }, [
    router,
    router.isReady,
    journeyId,
    router.query[CUSTOMIZE_SCREEN_QUERY_KEY],
    screens,
    t,
    enqueueSnackbar,
    onTemplatesRedirect
  ])

  // Only place we check the flag: if not true, guest has no access → redirect to language; if true, redirect guest off non-guest screens
  useEffect(() => {
    if (!router.isReady || !journeyId || user?.id != null) return
    const guestFlowEnabled = templateCustomizationGuestFlow === true
    if (!guestFlowEnabled || !isScreenAllowedForGuest(activeScreen)) {
      enqueueSnackbar(
        t('This step is not available for guests. You have been redirected.'),
        { variant: 'error', preventDuplicate: true }
      )
      router.replace(
        buildCustomizeUrl(
          journeyId,
          getFirstGuestAllowedScreen(),
          true,
          onTemplatesRedirect
        )
      )
    }
  }, [
    router,
    router.isReady,
    journeyId,
    user?.id,
    templateCustomizationGuestFlow,
    activeScreen,
    t,
    enqueueSnackbar,
    onTemplatesRedirect
  ])

  async function handleNext(): Promise<void> {
    const currentIndex = screens.indexOf(activeScreen)
    if (currentIndex < 0 || currentIndex >= screens.length - 1) return
    router.replace(
      buildCustomizeUrl(
        journeyId,
        screens[currentIndex + 1],
        undefined,
        onTemplatesRedirect
      )
    )
  }

  async function handleScreenNavigation(
    screen: CustomizationScreen
  ): Promise<void> {
    router.replace(
      buildCustomizeUrl(journeyId, screen, undefined, onTemplatesRedirect)
    )
  }

  const link = `/journeys/${journey?.id ?? ''}`

  return (
    <Container
      maxWidth="sm"
      sx={{
        width: '100%',
        minHeight: { xs: '100%', sm: MULTI_STEP_FORM_MIN_HEIGHT },
        backgroundColor: 'background.paper',
        borderRadius: { xs: '0px', sm: '16px' },
        mt: { xs: 0, sm: 6 },
        mb: { xs: 0, sm: 6 },
        py: 10
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
        {(hasEditableText || hasCustomizableLinks) && (
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
  )
}
