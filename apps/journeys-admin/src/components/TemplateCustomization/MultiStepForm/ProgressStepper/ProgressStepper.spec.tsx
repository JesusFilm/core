import { render, screen } from '@testing-library/react'

import { ProgressStepper } from './ProgressStepper'

describe('ProgressStepper', () => {
  it('should render checkmark icon for completed steps and not render for incomplete steps', () => {
    const activeStep = 2
    const totalSteps = 4

    render(
      <ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
    )

    const progressStepper = screen.getByTestId('progress-stepper')
    expect(progressStepper).toBeInTheDocument()

    const steps = screen.getAllByTestId(/progress-stepper-step-/)
    expect(steps).toHaveLength(totalSteps)

    const checkIcons = screen.getAllByTestId('CheckIcon')
    expect(checkIcons).toHaveLength(activeStep)
  })

  it('should render checkmark for all steps when on the last step', () => {
    const activeStep = 2
    const totalSteps = 2

    render(
      <ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
    )

    const checkIcons = screen.getAllByTestId('CheckIcon')
    expect(checkIcons).toHaveLength(totalSteps)
  })

  it('should not render any checkmarks when on the first step', () => {
    const activeStep = 0
    const totalSteps = 3

    render(
      <ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
    )

    const checkIcons = screen.queryAllByTestId('CheckIcon')
    expect(checkIcons).toHaveLength(activeStep)
  })
})
