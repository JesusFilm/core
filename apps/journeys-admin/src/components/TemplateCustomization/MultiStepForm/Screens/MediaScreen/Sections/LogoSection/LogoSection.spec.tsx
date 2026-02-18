import { render, screen } from '@testing-library/react'

import { LogoSection } from './LogoSection'

describe('LogoSection', () => {
  it('renders with LogoSection data-testid visible', () => {
    render(<LogoSection/>)
    expect(screen.getByTestId('LogoSection')).toBeInTheDocument()
  })
})
