import Box from '@mui/material/Box'
import MobileStepper from '@mui/material/MobileStepper'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

export function OnboardingStepper(): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')
  const onboarding =
    router.query.newAccount != null
      ? true
      : router.query.redirect?.includes('newAccount')

  function getActiveStep(): number {
    const path = router.pathname
    let step: number
    switch (path) {
      case '/users/sign-in':
        step = 0
        break
      case '/users/verify':
        step = 0
        break
      case '/users/terms-and-conditions':
        step = 1
        break
      case '/onboarding-form':
        step = 2
        break
      case '/teams/new':
        step = 3
        break
      default:
        step = 0
        break
    }
    return step
  }

  const activeStep = getActiveStep()

  const steps = [
    {
      label: t('Create an account')
    },
    {
      label: t('Terms and Conditions')
    },
    {
      label: t('User Insights')
    },
    {
      label: t('Create a Team')
    },
    {
      label: t('Journey Begins')
    }
  ]

  return (
    <>
      {onboarding === true && (
        <Box
          sx={{
            width: { xs: '100%', md: 244 },
            px: { lg: 3 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Stack gap={6} sx={{ display: { xs: 'none', md: 'flex' } }}>
            <Typography variant="h6">
              {t(`Let's get you on the journey`)}
            </Typography>
            <Stepper
              activeStep={activeStep}
              orientation="vertical"
              sx={{ px: 2 }}
            >
              {steps.map((step) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography variant="subtitle2">{step.label}</Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Stack>
          <MobileStepper
            variant="progress"
            steps={steps.length}
            position="static"
            activeStep={activeStep === 0 ? activeStep + 0.5 : activeStep}
            backButton={null}
            nextButton={null}
            sx={{
              display: { xs: 'flex', md: 'none' },
              width: '100%',
              p: 0,
              '& .MuiLinearProgress-root': {
                width: '100%'
              }
            }}
          />
        </Box>
      )}
    </>
  )
}
