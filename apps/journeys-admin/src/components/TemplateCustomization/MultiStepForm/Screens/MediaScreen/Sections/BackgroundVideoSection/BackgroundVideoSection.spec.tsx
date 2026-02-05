import { render, screen } from '@testing-library/react'

import { BackgroundVideoSection } from './BackgroundVideoSection'

describe('BackgroundVideoSection', () => {
  it('renders with BackgroundVideoSection data-testid visible', () => {
    render(<BackgroundVideoSection cardBlockId={null} />)
    expect(screen.getByTestId('BackgroundVideoSection')).toBeInTheDocument()
  })
})
