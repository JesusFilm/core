import { render, screen } from '@testing-library/react'

import { BackgroundImageSection } from './BackgroundImageSection'

describe('BackgroundImageSection', () => {
  it('renders with BackgroundImageSection data-testid visible', () => {
    render(<BackgroundImageSection cardBlockId={null} />)
    expect(screen.getByTestId('BackgroundImageSection')).toBeInTheDocument()
  })
})
