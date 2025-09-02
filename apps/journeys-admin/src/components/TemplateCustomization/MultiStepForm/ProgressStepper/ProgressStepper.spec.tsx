import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@mui/material/styles'
import { createTheme } from '@mui/material/styles'

import { ProgressStepper } from './ProgressStepper'

// Create a basic theme for testing
const theme = createTheme({
  palette: {
    primary: {
      main: '#C52D3A'
    },
    grey: {
      300: '#E0E0E0'
    }
  }
})

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  )
}

describe('ProgressStepper', () => {
  it('should render checkmark icon for completed steps and not render for incomplete steps', () => {
    const activeStep = 2
    const totalSteps = 4

    renderWithTheme(
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

    renderWithTheme(
      <ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
    )

    const checkIcons = screen.getAllByTestId('CheckIcon')
    expect(checkIcons).toHaveLength(totalSteps)
  })

  it('should not render any checkmarks when on the first step', () => {
    const activeStep = 0
    const totalSteps = 3

    renderWithTheme(
      <ProgressStepper activeStep={activeStep} totalSteps={totalSteps} />
    )

    const checkIcons = screen.queryAllByTestId('CheckIcon')
    expect(checkIcons).toHaveLength(activeStep)
  })
})
