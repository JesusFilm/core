import { render, screen } from '@testing-library/react'

import { VideosSection } from './VideosSection'

describe('VideosSection', () => {
  it('renders with VideosSection data-testid visible', () => {
    render(<VideosSection cardBlockId={null} />)
    expect(screen.getByTestId('VideosSection')).toBeInTheDocument()
  })
})
