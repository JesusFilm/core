import { fireEvent, render, screen } from '@testing-library/react'

import { ContentHeroMuteButton } from './ContentHeroMuteButton'

describe('ContentHeroMuteButton', () => {
  const mockOnClick = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders muted state correctly', () => {
    render(<ContentHeroMuteButton isMuted={true} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'muted')
  })

  it('renders unmuted state correctly', () => {
    render(<ContentHeroMuteButton isMuted={false} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'unmuted')
  })

  it('calls onClick handler when clicked', () => {
    render(<ContentHeroMuteButton isMuted={false} onClick={mockOnClick} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })
})
