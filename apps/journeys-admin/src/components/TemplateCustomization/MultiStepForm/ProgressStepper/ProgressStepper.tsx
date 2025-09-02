import Box from '@mui/material/Box'
import Step from '@mui/material/Step'
import StepConnector from '@mui/material/StepConnector'
import { StepIconProps } from '@mui/material/StepIcon'
import Stepper from '@mui/material/Stepper'
import Check from '@core/shared/ui/icons/Check'
import { ReactElement } from 'react'

interface ProgressStepperProps {
  activeStep: number
  totalSteps: number
}

export function ProgressStepper({
  activeStep,
  totalSteps
}: ProgressStepperProps): ReactElement {
  // Create steps array based on totalSteps
  const steps = Array.from({ length: totalSteps }, (_, index) => index)

  const ProgressStepperIcon = ({ icon }: StepIconProps): ReactElement => {
    const stepIndex = Number(icon) - 1
    const isLastScreen = activeStep === totalSteps - 1
    const isCurrentStep = stepIndex === activeStep
    const isCompleted = stepIndex < activeStep || isLastScreen

    return (
      <Box
        sx={{
          height: 24,
          width: 24,
          borderRadius: '50%',
          backgroundColor: isCompleted
            ? 'primary.main'
            : isCurrentStep
              ? '#C52D3A35'
              : 'white',
          // opacity: isCurrentStep && !isLastScreen ? 0.6 : 1,
          border: '2px solid',
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
        {isCompleted && (
          <Check
            sx={{ fontSize: 24, color: 'white' }}
          />
        )}
      </Box>
    )
  }

  const ProgressStepperConnector = (): ReactElement => {
    return (
      <StepConnector
        sx={{
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
            borderColor: 'grey.300',
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
        maxWidth: '70%',
        margin: '0 auto'
      }}
      data-testid="progress-stepper"
    >
      <Stepper
        activeStep={activeStep}
        connector={<ProgressStepperConnector />}
        sx={{
          '& .MuiStep-root': {
            // flex: 1,
            padding: '0 6px'
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
              <ProgressStepperIcon
                active={step < activeStep}
                completed={step < activeStep}
                icon={step + 1}
              />
            </Box>
          </Step>
        ))}
      </Stepper>
    </Box>
  )
}
