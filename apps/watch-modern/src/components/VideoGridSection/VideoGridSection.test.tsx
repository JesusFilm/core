import { render, screen } from '@testing-library/react'

import { VideoGridSection } from './index'

describe('VideoGridSection', () => {
  it('renders section title and heading', () => {
    render(<VideoGridSection />)
    expect(screen.getByText('FEATURED VIDEOS')).toBeInTheDocument()
    expect(screen.getByText('Explore the Video Library')).toBeInTheDocument()
  })

  it('renders 10 hardcoded items by default', () => {
    render(<VideoGridSection />)
    const cards = screen.getAllByRole('button')
    expect(cards.length).toBeGreaterThanOrEqual(10)
  })

  it('applies responsive grid classes', () => {
    render(<VideoGridSection />)
    const grid = screen.getByText('Video 1: Journey of Faith').closest('.grid')
    expect(grid).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4')
  })

  it('renders loading skeletons when isLoading is true', () => {
    render(<VideoGridSection isLoading />)
    const skeletons = screen.getAllByTestId('item-loading-skeleton')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('supports optional numbering labels when showNumbering is true', () => {
    render(<VideoGridSection showNumbering />)
    const numbered = screen.getAllByText(/^Item \d+$/)
    expect(numbered.length).toBeGreaterThan(0)
  })
})

