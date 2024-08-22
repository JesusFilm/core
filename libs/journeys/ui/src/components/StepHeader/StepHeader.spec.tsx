import { render, screen } from '@testing-library/react'

import { StepHeader } from './StepHeader'

describe('StepHeader', () => {
  it('should render', () => {
    render(<StepHeader />)

    expect(screen.getByTestId('InformationButton')).toBeInTheDocument()
    expect(screen.getByTestId('pagination-bullets')).toBeInTheDocument()
  })
})
