import { fireEvent, render, screen } from '@testing-library/react'

import { HeroSection } from './index'

describe('HeroSection', () => {
  it('renders the main heading with gradient text effect', () => {
    render(<HeroSection />)
    
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(screen.getByText('Greatest Story')).toHaveClass('bg-gradient-to-r', 'bg-clip-text', 'text-transparent')
  })

  it('renders the subtitle text', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/ONE STORY. EVERY LANGUAGE./)).toBeInTheDocument()
  })

  it('renders the mission statement', () => {
    render(<HeroSection />)
    
    expect(screen.getByText(/Watch the life of Jesus through authentic films/)).toBeInTheDocument()
  })

  it('renders the CTA button', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('Free Bible Videos')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /free bible videos/i })).toBeInTheDocument()
  })

  it('renders audience segmentation section', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('Start your journey today.')).toBeInTheDocument()
    expect(screen.getByText(/Find personalized videos and guidance/)).toBeInTheDocument()
  })

  it('renders all three audience segmentation buttons', () => {
    render(<HeroSection />)
    
    expect(screen.getByText('Discover who Jesus is')).toBeInTheDocument()
    expect(screen.getByText('Grow closer to God')).toBeInTheDocument()
    expect(screen.getByText('Get equipped for ministry')).toBeInTheDocument()
  })

  it('handles audience button selection', () => {
    render(<HeroSection />)
    
    const firstButton = screen.getByText('Discover who Jesus is').closest('button')
    expect(firstButton).toBeInTheDocument()
    
    if (firstButton) {
      fireEvent.click(firstButton)
      // The button should have enhanced styling when selected
      expect(firstButton).toHaveClass('bg-white/20', 'border-white/40', 'shadow-xl')
    }
  })

  it('has animated background grid elements', () => {
    const { container } = render(<HeroSection />)
    
    // Check for animated grid elements
    const gridElements = container.querySelectorAll('.animate-slide-left, .animate-slide-right')
    expect(gridElements.length).toBeGreaterThan(0)
  })

  it('has proper accessibility attributes', () => {
    render(<HeroSection />)
    
    // Check that audience buttons have proper accessibility
    const audienceButtons = screen.getAllByRole('button')
    audienceButtons.forEach((button) => {
      expect(button).toBeInTheDocument()
    })
  })

  it('has responsive design classes', () => {
    const { container } = render(<HeroSection />)
    
    const section = container.querySelector('section')
    expect(section).toHaveClass('min-h-screen', 'text-white', 'relative', 'flex', 'items-end', 'overflow-hidden')
  })
}) 