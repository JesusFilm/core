import { render, screen } from '@testing-library/react'
import { CategoriesSection } from './index'

describe('CategoriesSection', () => {
  it('renders the section title and heading', () => {
    render(<CategoriesSection />)
    
    expect(screen.getByText('BIBLICAL CATEGORIES')).toBeInTheDocument()
    expect(screen.getByText('Explore by Theme')).toBeInTheDocument()
  })

  it('renders 12 category cards by default', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button')
    // 12 category cards + 2 "SEE ALL" buttons (desktop and mobile)
    expect(categoryCards).toHaveLength(14)
  })

  it('renders all category titles', () => {
    render(<CategoriesSection />)
    
    expect(screen.getByText("Jesus' Life & Teachings")).toBeInTheDocument()
    expect(screen.getByText('Faith & Salvation')).toBeInTheDocument()
    expect(screen.getByText('Hope & Healing')).toBeInTheDocument()
    expect(screen.getByText('Forgiveness & Grace')).toBeInTheDocument()
    expect(screen.getByText('Suffering & Struggle')).toBeInTheDocument()
    expect(screen.getByText('Identity & Purpose')).toBeInTheDocument()
    expect(screen.getByText('Love & Relationships')).toBeInTheDocument()
    expect(screen.getByText('Prayer & Spiritual Growth')).toBeInTheDocument()
    expect(screen.getByText('Miracles & Power of God')).toBeInTheDocument()
    expect(screen.getByText('Death & Resurrection')).toBeInTheDocument()
    expect(screen.getByText('Justice & Compassion')).toBeInTheDocument()
    expect(screen.getByText('Discipleship & Mission')).toBeInTheDocument()
  })

  it('renders loading skeletons when isLoading is true', () => {
    render(<CategoriesSection isLoading />)
    
    const skeletons = screen.getAllByTestId('category-loading-skeleton')
    expect(skeletons).toHaveLength(24) // 12 cards * 2 skeleton elements each
  })

  it('renders "SEE ALL" buttons', () => {
    render(<CategoriesSection />)
    
    const seeAllButtons = screen.getAllByLabelText('see all categories')
    expect(seeAllButtons).toHaveLength(2) // Desktop and mobile versions
  })

  it('has proper accessibility attributes on category cards', () => {
    render(<CategoriesSection />)
    
    // Get only the category cards (excluding "SEE ALL" buttons)
    const categoryCards = screen.getAllByLabelText(/Browse .* category/)
    categoryCards.forEach((card) => {
      expect(card).toHaveAttribute('tabindex', '0')
      expect(card).toHaveAttribute('aria-label')
    })
  })

  it('applies responsive grid classes', () => {
    const { container } = render(<CategoriesSection />)
    
    const gridContainer = container.querySelector('.grid')
    expect(gridContainer).toHaveClass(
      'grid-cols-2',
      'sm:grid-cols-3',
      'lg:grid-cols-4',
      'xl:grid-cols-6'
    )
  })
})
