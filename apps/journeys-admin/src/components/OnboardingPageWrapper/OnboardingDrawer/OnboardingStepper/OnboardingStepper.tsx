import Box from '@mui/material/Box'
import MobileStepper from '@mui/material/MobileStepper'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import { StepIconProps } from '@mui/material/StepIcon'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import compact from 'lodash/compact'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, ReactNode } from 'react'

import Circle from '@core/shared/ui/icons/Circle'

type Variant = 'mobile' | 'desktop'
interface OnboardingStepperProps {
  variant: Variant
}

export function OnboardingStepper({
  variant
}: OnboardingStepperProps): ReactElement {
  const router = useRouter()
  const { t } = useTranslation('apps-journeys-admin')

  function getActiveStep(): number {
    const path = router.pathname
    let step: number
    switch (path) {
      case '/users/sign-in':
      case '/users/verify':
        step = 0
        break
      case '/users/terms-and-conditions':
        step = 1
        break
      case '/teams/new':
        step = 2
        break
      default:
        step = 0
        break
    }
    return step
  }

  const activeStep = getActiveStep()
  const quick =
    router.query?.redirect?.toString().match(/\/templates\/[\w-]+\/quick/) !=
    null

  const steps = compact([
    {
      label: t('Create an account')
    },
    {
      label: t('Terms and Conditions')
    },
    quick
      ? {
          label: t('Express Setup')
        }
      : undefined
  ])

  const OnboardingStepperIcon = ({
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

  const OnboardingStepperConnector = (): ReactNode => {
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
    <>
      {variant === 'desktop' && (
        <Stack
          gap={5}
          sx={{
            display: { xs: 'none', md: 'flex' },
            width: 244
          }}
        >
          <Typography variant="h4">
            {t(`Let's get you on the journey`)}
          </Typography>
          <Stepper
            activeStep={activeStep}
            orientation="vertical"
            connector={<OnboardingStepperConnector />}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <OnboardingStepperIcon {...props} stepLabel={step.label} />
                  )}
                  sx={{ p: 0, py: 1 }}
                >
                  <Typography variant="subtitle2">{step.label}</Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Stack>
      )}
      {variant === 'mobile' && (
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
      )}
    </>
  )
}
