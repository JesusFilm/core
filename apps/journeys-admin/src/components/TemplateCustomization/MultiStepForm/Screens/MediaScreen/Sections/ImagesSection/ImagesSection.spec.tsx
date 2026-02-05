import { render, screen } from '@testing-library/react'

import { ImagesSection } from './ImagesSection'

describe('ImagesSection', () => {
  it('renders with ImagesSection data-testid visible', () => {
    render(<ImagesSection cardBlockId={null} />)
    expect(screen.getByTestId('ImagesSection')).toBeInTheDocument()
  })
})
