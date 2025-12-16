import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FreeResourceCard, type FreeResourceProps } from './FreeResourceCard'

const MOCK_ICON_TEXT = 'Icon'
const MockIcon = () => <span data-testid="mock-icon">{MOCK_ICON_TEXT}</span>

const defaultProps: FreeResourceProps = {
  heading: 'Free Resource',
  text: 'This is a test free resource description'
}

describe('FreeResourceCard', () => {
  it('renders with required props', () => {
    render(<FreeResourceCard {...defaultProps} />)

    expect(screen.getByText('Free Resource')).toBeInTheDocument()
    expect(
      screen.getByText('This is a test free resource description')
    ).toBeInTheDocument()
  })

  it('renders with custom image URL', () => {
    const customImageUrl = 'https://example.com/custom-image.jpg'
    render(<FreeResourceCard {...defaultProps} imageUrl={customImageUrl} />)

    const image = screen.getByAltText('Bible Citation')
    expect(image).toHaveAttribute('src', customImageUrl)
  })

  it('renders with default fallback image when no imageUrl provided', () => {
    render(<FreeResourceCard {...defaultProps} />)

    const image = screen.getByAltText('Bible Citation')
    expect(image).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1650658720644-e1588bd66de3?w=900&auto=format&fit=crop&q=60'
    )
  })

  it('does not render CTA button when cta prop is not provided', () => {
    render(<FreeResourceCard {...defaultProps} />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders CTA button when cta prop is provided', () => {
    const handleClick = jest.fn()
    const ctaProps = {
      label: 'Join Now',
      onClick: handleClick
    }

    render(<FreeResourceCard {...defaultProps} cta={ctaProps} />)

    const button = screen.getByRole('link')
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Join Now')
  })

  it('calls onClick handler when CTA button is clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()
    const ctaProps = {
      label: 'Join Now',
      onClick: handleClick
    }

    render(<FreeResourceCard {...defaultProps} cta={ctaProps} />)

    const button = screen.getByRole('link')
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders icon in CTA button when icon prop is provided', () => {
    const handleClick = jest.fn()
    const ctaProps = {
      label: 'Join Now',
      onClick: handleClick,
      icon: MockIcon
    }

    render(<FreeResourceCard {...defaultProps} cta={ctaProps} />)

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    expect(screen.getByText('Join Now')).toBeInTheDocument()
  })

  it('does not render icon when icon prop is not provided', () => {
    const handleClick = jest.fn()
    const ctaProps = {
      label: 'Join Now',
      onClick: handleClick
    }

    render(<FreeResourceCard {...defaultProps} cta={ctaProps} />)

    expect(screen.queryByTestId('mock-icon')).not.toBeInTheDocument()
    expect(screen.getByText('Join Now')).toBeInTheDocument()
  })

  it('handles all props together correctly', () => {
    const handleClick = jest.fn()
    const fullProps: FreeResourceProps = {
      imageUrl: 'https://example.com/test-image.jpg',
      bgColor: '#123456',
      heading: 'Complete Test',
      text: 'Full props test description',
      cta: {
        label: 'Test Action',
        onClick: handleClick,
        icon: MockIcon
      }
    }

    render(<FreeResourceCard {...fullProps} />)

    expect(screen.getByText('Complete Test')).toBeInTheDocument()
    expect(screen.getByText('Full props test description')).toBeInTheDocument()
    expect(screen.getByText('Test Action')).toBeInTheDocument()
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
    expect(screen.getByAltText('Bible Citation')).toHaveAttribute(
      'src',
      'https://example.com/test-image.jpg'
    )
  })
})
