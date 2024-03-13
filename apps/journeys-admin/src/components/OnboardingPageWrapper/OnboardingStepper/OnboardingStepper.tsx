import Box from '@mui/material/Box'
import MobileStepper from '@mui/material/MobileStepper'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import { StepIconProps } from '@mui/material/StepIcon'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import Circle from '@core/shared/ui/icons/Circle'

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

  const OnboardingStepIcon = ({
    active,
    completed,
    stepLabel
  }: StepIconProps & { stepLabel: string }): ReactNode => {
    return (
      <Box
        sx={{
          height: 24,
          width: 24,
          borderRadius: '100%',
          backgroundColor:
            completed === true || active === true
              ? 'primary.main'
              : 'background.default',
          position: 'relative'
        }}
      >
        {active === true && (
          <Circle
            data-testid={stepLabel}
            sx={{
              color: 'background.paper',
              backgroundColor: 'background.paper',
              transform: 'scale(0.2)',
              borderRadius: '100%',
              position: 'absolute'
            }}
          />
        )}
      </Box>
    )
  }

  const OnboardingStepConnector = (): ReactNode => {
    return (
      <StepConnector
        sx={{
          marginLeft: '10.5px',
          '&.Mui-active': {
            '& .MuiStepConnector-line': {
              borderColor: 'primary.main'
            }
          },
          '&.Mui-completed': {
            '& .MuiStepConnector-line': {
              borderColor: 'primary.main'
            }
          },
          '& .MuiStepConnector-line': {
            borderColor: 'background.default',
            borderLeftWidth: 2.5,
            minHeight: '32px'
          }
        }}
      />
    )
  }

  return (
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
          activeStep={currentStep}
          orientation="vertical"
          connector={<OnboardingStepConnector />}
        >
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel
                StepIconComponent={(props) => (
                  <OnboardingStepIcon {...props} stepLabel={step.label} />
                )}
                sx={{ p: 0, py: 1 }}
              >
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
