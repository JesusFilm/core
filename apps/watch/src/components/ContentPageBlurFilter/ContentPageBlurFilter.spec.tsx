import { render, screen } from '@testing-library/react'

import { ContentPageBlurFilter } from './ContentPageBlurFilter'

describe('ContentPageBlurFilter', () => {
  it('renders children within the container', () => {
    render(
      <ContentPageBlurFilter>
        <div data-testid="child-content">Test Content</div>
      </ContentPageBlurFilter>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders the blur filter overlay', () => {
    render(
      <ContentPageBlurFilter>
        <div>Content</div>
      </ContentPageBlurFilter>
    )

    const blurFilter = screen.getByTestId('ContentPageBlurFilter')
    expect(blurFilter).toBeInTheDocument()
    // Backdrop filter is applied via Tailwind CSS classes
  })

  it('applies correct styling to main container', () => {
    render(
      <ContentPageBlurFilter>
        <div>Content</div>
      </ContentPageBlurFilter>
    )

    const container = screen.getByTestId('ContentPage')
    expect(container).toHaveClass('text-white', 'relative', 'font-sans')
    expect(container).toHaveStyle('min-height: 100svh')
  })

  it('positions content container correctly', () => {
    render(
      <ContentPageBlurFilter>
        <div>Content</div>
      </ContentPageBlurFilter>
    )

    const contentContainer = screen.getByTestId('ContentPageContainer')
    expect(contentContainer).toHaveClass('relative', 'z-10')
    expect(contentContainer).toHaveStyle('margin-top: -100vh')
  })
})
