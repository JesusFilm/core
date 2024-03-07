import Box from '@mui/material/Box'
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

  const currentStep = getCurrentStep()

  const steps = [
    {
      label: t('Sign up or Log in')
    },
    {
      label: t('Terms and Conditions')
    },
    {
      label: t('Final Details')
    },
    {
      label: t('Create a Team')
    },
    {
      label: t('Journey Ready!')
    }
  ]

  return (
    <Box
      sx={{
        width: 244,
        display: { xs: 'none', sm: 'flex' },
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <Box sx={{ p: 4 }}>
        <Typography variant="h6">
          {t(`Let's get you on the journey`)}
        </Typography>
      </Box>
      <Stepper activeStep={currentStep} orientation="vertical">
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>
              <Typography variant="subtitle2">{step.label}</Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
