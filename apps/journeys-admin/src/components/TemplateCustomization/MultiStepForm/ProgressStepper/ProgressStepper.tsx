import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import { StepIconProps } from '@mui/material/StepIcon'
import Stepper from '@mui/material/Stepper'
import Check from '@core/shared/ui/icons/Check'
import { ReactElement } from 'react'

interface ProgressStepperProps {
  activeStepNumber: number
  totalSteps: number
}

export function ProgressStepper({
  activeStepNumber,
  totalSteps
}: ProgressStepperProps): ReactElement {
  // Create steps array based on totalSteps
  const steps = Array.from({ length: totalSteps - 1 }, (_, index) => index)

  const ProgressStepperIcon = ({ icon }: StepIconProps): ReactElement => {
    const stepIndex = Number(icon)
    const isLastScreen = activeStepNumber === totalSteps - 1
    const isCurrentStep = stepIndex === activeStepNumber
    const isCompleted = stepIndex < activeStepNumber || isLastScreen

    return (
      <Box
        sx={{
          height: 16,
          width: 16,
          borderRadius: '50%',
          backgroundColor: isCompleted
            ? 'secondary.light'
            : isCurrentStep
              ? 'white'
              : 'divider',
          ...(isCurrentStep && { border: '5px solid' }),
          borderColor: isCompleted
            ? 'primary.main'
            : isCurrentStep
              ? 'primary.main'
              : 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isCompleted && <Check sx={{ fontSize: 16, color: 'white' }} />}
      </Box>
    )
  }

  const ProgressStepperConnector = (): ReactElement => {
    return (
      <StepConnector
        sx={{
          '&.Mui-active': {
            '& .MuiStepConnector-line': {
              borderColor: 'secondary.light'
            }
          },
          '&.Mui-completed': {
            '& .MuiStepConnector-line': {
              borderColor: 'secondary.light'
            }
          },
          '& .MuiStepConnector-line': {
            borderColor: 'divider',
            borderRadius: '1px',
            borderTopWidth: 2,
            minHeight: '2px'
          }
        }}
      />
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: { xs: '45%', sm: '30%' },
        margin: '0 auto'
      }}
      data-testid="progress-stepper"
    >
      <Stepper
        activeStep={activeStepNumber}
        connector={<ProgressStepperConnector />}
        sx={{
          '& .MuiStep-root': {
            padding: '0 3px'
          },
          '& .MuiStepLabel-root': {
            padding: 0
          }
        }}
      >
        {steps.map((step) => (
          <Step key={step} data-testid={`progress-stepper-step-${step}`}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ProgressStepperIcon icon={step} />
            </Box>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
