import { render, screen } from '@testing-library/react'

import { CardsSection } from './CardsSection'

describe('CardsSection', () => {
  it('renders with CardsSection data-testid visible', () => {
    render(<CardsSection onChange={() => {}} />)
    expect(screen.getByTestId('CardsSection')).toBeInTheDocument()
  })
})
