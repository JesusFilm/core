import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState, useMemo } from 'react'

import { ProgressStepper } from './ProgressStepper'
import {
  DoneScreen,
  LanguageScreen,
  LinksScreen,
  TextScreen,
  SocialScreen
} from './Screens'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'
import {
  getCustomizeFlowConfig,
  CustomizationScreen
} from '../utils/getCustomizeFlowConfig'

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
  const { journey } = useJourney()

  const { screens, totalSteps } = useMemo(
    () => getCustomizeFlowConfig(journey, t),
    []
  )

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
      <Stack gap={{ xs: 3, sm: 4 }} data-testid="MultiStepForm">
        <NextLink href={link} passHref legacyBehavior>
          <Button
            variant="text"
            color="primary"
            endIcon={<ChevronRight />}
            sx={{
              alignSelf: 'flex-end',
              mr: '4px',
              fontWeight: 'bold',
              '& .MuiButton-endIcon': {
                marginLeft: '0px'
              }
            }}
            disabled={journey?.id == null}
          >
            {t('Edit Manually')}
          </Button>
        </NextLink>
        {totalSteps > 3 && (
          <ProgressStepper
            activeStepNumber={screens.indexOf(activeScreen)}
            totalSteps={totalSteps}
          />
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

        {/* TODO: delete back button. This is only here for the dev's to use */}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (activeScreen > 0) {
              setActiveScreen(activeScreen - 1)
            }
          }}
          sx={{ width: '300px', alignSelf: 'center' }}
        >
          {`back (this will be deleted)`}
        </Button> */}
      </Stack>
    </Container>
  )
}
