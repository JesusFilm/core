import { render, screen } from '@testing-library/react'
import { CategoriesSection } from './index'

describe('CategoriesSection (Improved)', () => {
  it('renders the section title and heading', () => {
    render(<CategoriesSection />)

    expect(screen.getByText('BROWSE BY CATEGORY')).toBeInTheDocument()
    expect(screen.getByText('Discover Content by Topic')).toBeInTheDocument()
  })

  it('renders 12 category cards with button semantics and labels', () => {
    render(<CategoriesSection />)

    const categoryCards = screen.getAllByLabelText(/Browse .* category/)
    expect(categoryCards).toHaveLength(12)
    categoryCards.forEach((card) => {
      expect(card).toHaveAttribute('tabindex', '0')
      expect(card).toHaveAttribute('role', 'button')
    })
  })

  it('renders carousel navigation buttons with accessible labels', () => {
    render(<CategoriesSection />)

    expect(screen.getByText('Previous slide')).toBeInTheDocument()
    expect(screen.getByText('Next slide')).toBeInTheDocument()
  })

  it('applies gradient backgrounds to category cards', () => {
    const { container } = render(<CategoriesSection />)

    const gradientCards = container.querySelectorAll(
      '.bg-gradient-to-br'
    )
    // Should find 12 gradient-backed cards
    expect(gradientCards.length).toBeGreaterThanOrEqual(12)
  })

  it('renders loading skeletons when isLoading is true', () => {
    render(<CategoriesSection isLoading />)

    const skeletons = screen.getAllByTestId('category-loading-skeleton')
    expect(skeletons.length).toBeGreaterThanOrEqual(12)
  })
})
