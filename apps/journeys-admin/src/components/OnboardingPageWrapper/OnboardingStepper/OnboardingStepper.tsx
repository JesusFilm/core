import Box from '@mui/material/Box'
import MobileStepper from '@mui/material/MobileStepper'
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

  function getCurrentStep(): number {
    const path = router.pathname
    let step: number
    switch (path) {
      case '/users/sign-in':
        step = 0
        break
      case '/users/verify':
        step = 1
        break
      case '/users/terms-and-conditions':
        step = 2
        break
      case '/onboarding-form':
        step = 3
        break
      case '/teams/new':
        step = 4
        break
      default:
        step = 0
        break
    }
    return step
  }

  const currentStep = getCurrentStep()

  const steps = [
    {
      label: t('Sign up or Log in')
    },
    {
      label: t('Verify your account')
    },
    {
      label: t('Terms and Conditions')
    },
    {
      label: t('Final Details')
    },
    {
      label: t('Create a Team')
    }
  ]

  return (
    <Box
      sx={{
        width: 244,
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">
          {t(`Let's get you on the journey`)}
        </Typography>
      </Box>
      <Stepper
        activeStep={currentStep}
        orientation="vertical"
        sx={{ display: { xs: 'none', md: 'flex' } }}
      >
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle2">{step.label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <MobileStepper
        variant="progress"
        steps={steps.length}
        position="static"
        activeStep={currentStep === 0 ? currentStep + 0.5 : currentStep}
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
  )
}
