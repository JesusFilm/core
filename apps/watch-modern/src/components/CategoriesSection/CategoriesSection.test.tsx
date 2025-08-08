import { render, screen } from '@testing-library/react'

import { CategoriesSection } from './index'

describe('CategoriesSection', () => {
  it('renders the section title and heading', () => {
    render(<CategoriesSection />)
    
    expect(screen.getByText('BROWSE BY CATEGORY')).toBeInTheDocument()
    expect(screen.getByText('Discover Content by Topic')).toBeInTheDocument()
  })

  it('renders 12 category cards by default', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button')
    // 12 category cards + 1 "SEE ALL" button + 2 carousel navigation buttons
    expect(categoryCards).toHaveLength(15)
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
    
    // Check for loading skeleton elements
    const skeletonElements = screen.getAllByText('')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })

  it('renders "SEE ALL" button', () => {
    render(<CategoriesSection />)
    
    const seeAllButton = screen.getByText('SEE ALL')
    expect(seeAllButton).toBeInTheDocument()
  })

  it('has proper accessibility attributes on category cards', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    categoryCards.forEach((card) => {
      expect(card).toHaveAttribute('role', 'button')
      expect(card).toHaveAttribute('tabIndex', '0')
      expect(card).toHaveAttribute('aria-label')
    })
  })

  it('applies carousel layout classes', () => {
    render(<CategoriesSection />)
    
    const carousel = screen.getByTestId('carousel')
    const carouselContent = screen.getByTestId('carousel-content')
    const carouselItems = screen.getAllByTestId('carousel-item')
    
    expect(carousel).toBeInTheDocument()
    expect(carouselContent).toBeInTheDocument()
    expect(carouselItems.length).toBeGreaterThan(0)
  })

  it('renders carousel navigation buttons', () => {
    render(<CategoriesSection />)
    
    const navigationButtons = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Previous') || 
      button.getAttribute('aria-label')?.includes('Next')
    )
    expect(navigationButtons).toHaveLength(2)
  })

  it('renders category cards with gradient backgrounds', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      expect(card).toHaveClass('bg-gradient-to-br')
    })
  })

  it('renders category cards with enhanced hover effects', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      expect(card).toHaveClass('hover:scale-105')
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-300')
    })
  })

  it('renders category cards with proper aspect ratio', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      expect(card).toHaveClass('aspect-[4/5]')
    })
  })

  it('renders category cards with noise texture overlay', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      const overlay = card.querySelector('div[style*="overlay.d86a559d.svg"]')
      expect(overlay).toBeInTheDocument()
    })
  })

  it('renders category cards with proper icon positioning', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      const iconContainer = card.querySelector('.absolute.top-4.right-4')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  it('renders category cards with proper content positioning', () => {
    render(<CategoriesSection />)
    
    const categoryCards = screen.getAllByRole('button').filter(button => 
      button.getAttribute('aria-label')?.includes('Browse')
    )
    
    categoryCards.forEach((card) => {
      const contentContainer = card.querySelector('.absolute.bottom-0.left-0.right-0.p-4')
      expect(contentContainer).toBeInTheDocument()
    })
  })
})
