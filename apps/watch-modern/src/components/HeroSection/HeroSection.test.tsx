import { render, screen } from '@testing-library/react'

import { HeroSection } from './index'

describe('HeroSection', () => {
  it('renders correctly', () => {
    const { container } = render(<HeroSection />)
    expect(container).toMatchSnapshot()
  })

  it('displays the main heading', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveTextContent('Watch the Greatest Story Ever Told')
  })

  it('displays the mission statement', () => {
    render(<HeroSection />)
    const missionText = screen.getByText(/Watch the life of Jesus through authentic films/)
    expect(missionText).toBeInTheDocument()
  })

  it('has a CTA button', () => {
    render(<HeroSection />)
    const ctaButton = screen.getByRole('button', { name: /Free Bible Videos/i })
    expect(ctaButton).toBeInTheDocument()
  })

  it('displays the language tagline', () => {
    render(<HeroSection />)
    const languageTagline = screen.getByText('ONE STORY. EVERY LANGUAGE.')
    expect(languageTagline).toBeInTheDocument()
  })

  it('displays the audience segmentation section', () => {
    render(<HeroSection />)
    const audienceHeading = screen.getByRole('heading', { level: 2 })
    expect(audienceHeading).toHaveTextContent('Start your journey today.')
  })

  it('has proper semantic structure', () => {
    render(<HeroSection />)
    const section = document.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('has responsive padding to prevent header overlap', () => {
    render(<HeroSection />)
    const section = document.querySelector('section')
    expect(section).toHaveClass('pt-[60px]', 'sm:pt-[80px]', 'lg:pt-[120px]')
  })
}) 