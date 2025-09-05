import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import NextLink from 'next/link'
import Stack from '@mui/material/Stack'
import { useTranslation } from 'next-i18next'
import { ReactElement, useState } from 'react'

import { ProgressStepper } from './ProgressStepper'
import { DoneScreen, LanguageScreen, LinksScreen, TextScreen } from './Screens'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

// NOTE: login is a dialog -> regular sign up path (that can show the image/title from journey) -> redirects back current step (URL parameter)
// NOTE: share is a dialog
const screens = ['language', 'text', 'links', 'social', 'done']

function renderScreen(screen: number, handleNext: () => void): ReactElement {
  switch (screen) {
    case 0:
      return <LanguageScreen handleNext={handleNext} />
    case 1:
      return <TextScreen handleNext={handleNext} />
    case 2:
      return <LinksScreen handleNext={handleNext} />
    // TODO: uncomment this when we have the social screen
    // case 3:
    //   return <SocialScreen handleNext={handleNext} />
    case 3:
      return <DoneScreen />
    default:
      return <></>
  }
}

export function MultiStepForm(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const [activeScreen, setActiveScreen] = useState(0)

  async function handleNext(): Promise<void> {
    if (activeScreen !== screens.length - 1) {
      setActiveScreen(activeScreen + 1)
    }
  }

  const link = `/journeys/${journey?.id ?? ''}`

  return (
    <Container
      maxWidth="sm"
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: { xs: '100%', sm: '852px' },
        backgroundColor: 'background.paper',
        borderRadius: { xs: '0px', md: '16px' },
        mt: { xs: 0, sm: 6 },
        mb: { xs: 0, sm: 6 }
      }}
    >
      <Stack gap={12} data-testid="MultiStepForm">
        <NextLink href={link} passHref legacyBehavior>
          <Button
            variant="text"
            color="primary"
            endIcon={<ChevronRight />}
            sx={{
              alignSelf: 'flex-end',
              mt: '14px',
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

        <ProgressStepper
          activeStep={activeScreen}
          totalSteps={screens.length}
        />

        <Box
          sx={{ alignSelf: 'center', width: '100%', px: '14px', pb: '24px' }}
        >
          {renderScreen(activeScreen, handleNext)}
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
