import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'
import { ReactElement, useMemo, useState } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit3 from '@core/shared/ui/icons/Edit3'

import {
  CustomizationScreen,
  getCustomizeFlowConfig
} from '../utils/getCustomizeFlowConfig'

import { ProgressStepper } from './ProgressStepper'
import {
  DoneScreen,
  GuestPreviewScreen,
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
    // case 'done':
    case 'guestPreview':
      return <DoneScreen handleScreenNavigation={handleScreenNavigation} />
    // case 'guestPreview':
    case 'done':
      return (
        <GuestPreviewScreen handleScreenNavigation={handleScreenNavigation} />
      )
    default:
      return <></>
  }
}

export function MultiStepForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()

  const { screens, totalSteps, hasEditableText, hasCustomizableLinks } =
    useMemo(() => getCustomizeFlowConfig(journey, t), [])

  const [activeScreen, setActiveScreen] =
    useState<CustomizationScreen>('language')

  async function handleNext(): Promise<void> {
    if (activeScreen !== screens[screens.length - 1]) {
      setActiveScreen(screens[screens.indexOf(activeScreen) + 1])
    }
  }

  async function handleScreenNavigation(
    screen: CustomizationScreen
  ): Promise<void> {
    setActiveScreen(screen)
  }

  const link = `/journeys/${journey?.id ?? ''}`

  const activeStepForStepper =
    activeScreen === 'guestPreview'
      ? screens.indexOf('guestPreview') - 1
      : screens.indexOf(activeScreen)

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
              activeStepNumber={activeStepForStepper}
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
