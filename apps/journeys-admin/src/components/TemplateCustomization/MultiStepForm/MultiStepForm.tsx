import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { ProgressStepper } from './ProgressStepper'
import { DoneScreen, LanguageScreen, LinksScreen, TextScreen } from './Screens'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

// NOTE: login is a dialog -> regular sign up path (that can show the image/title from journey) -> redirects back current step (URL parameter)
// NOTE: share is a dialog
const screens = ['language', 'text', 'links', 'social', 'done'] as const

export type Screen = (typeof screens)[number]

function renderScreen(screen: Screen, handleNext: () => void): ReactElement {
  switch (screen) {
    case 'language':
      return <LanguageScreen handleNext={handleNext} />
    case 'text':
      return <TextScreen handleNext={handleNext} />
    case 'links':
      return <LinksScreen handleNext={handleNext} />
    // TODO: uncomment this when we have the social screen
    // case 3:
    //   return <SocialScreen handleNext={handleNext} />
    case 'done':
      return <DoneScreen />
    default:
      return <></>
  }
}

export function MultiStepForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [activeScreen, setActiveScreen] = useState<Screen>('language')

  async function handleNext(): Promise<void> {
    if (activeScreen !== screens[screens.length - 1]) {
      setActiveScreen(screens[screens.indexOf(activeScreen) + 1])
    }
  }

  const link = `/journeys/${journey?.id ?? ''}`

  return (
    <Container
      maxWidth="lg"
      sx={{
        height: '100%',
        width: '100%',
        backgroundColor: 'background.paper'
      }}
    >
      <Stack gap={12} data-testid="MultiStepForm">
        <NextLink href={link} passHref legacyBehavior>
          <Button
            variant="text"
            color="secondary"
            endIcon={<ArrowRightIcon />}
            sx={{ alignSelf: 'flex-end' }}
            disabled={journey?.id == null}
          >
            {t('Edit Manually')}
          </Button>
        </NextLink>

        <ProgressStepper
          activeStep={screens.indexOf(activeScreen)}
          totalSteps={screens.length}
        />

        <Box sx={{ alignSelf: 'center', width: '100%' }}>
          {renderScreen(activeScreen, handleNext)}
        </Box>

        {/* TODO: delete back button. This is only here for the dev's to use */}
        {/* <Button
          variant="contained"
          color="primary"
          onClick={() => {
            if (screens.indexOf(activeScreen) > 0) {
              setActiveScreen(screens[screens.indexOf(activeScreen) - 1])
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
