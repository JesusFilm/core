import { render, screen } from '@testing-library/react'
import { StepBlockNodeAnalytics } from '.'

describe('StepBlockNodeAnalytics', () => {
  it('should render', () => {
    render(
      <StepBlockNodeAnalytics
        visitors={1000}
        visitorsExitAtStep={100}
        timeOnPage={72}
      />
    )

    expect(screen.getByText('1000')).toBeInTheDocument()
    expect(screen.getByText('10%')).toBeInTheDocument()
    expect(screen.getByText('1m12s')).toBeInTheDocument()
  })

  it('should render fallbacks', () => {
    render(<StepBlockNodeAnalytics />)

    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('0s')).toBeInTheDocument()
  })
})
