import { render, screen, fireEvent } from '@testing-library/react'
import { MuteToggle } from './MuteToggle'

describe('MuteToggle', () => {
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders mute button when muted', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    expect(screen.getByLabelText('Unmute video')).toBeInTheDocument()
  })

  it('renders unmute button when not muted', () => {
    render(<MuteToggle isMuted={false} onToggle={mockOnToggle} />)

    expect(screen.getByLabelText('Mute video')).toBeInTheDocument()
  })

  it('calls onToggle when button is clicked', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    fireEvent.click(screen.getByLabelText('Unmute video'))

    expect(mockOnToggle).toHaveBeenCalledTimes(1)
  })

  it('has correct aria-pressed attribute', () => {
    const { rerender } = render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    expect(screen.getByLabelText('Unmute video')).toHaveAttribute('aria-pressed', 'false')

    rerender(<MuteToggle isMuted={false} onToggle={mockOnToggle} />)

    expect(screen.getByLabelText('Mute video')).toHaveAttribute('aria-pressed', 'true')
  })

  it('has proper accessibility attributes', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    const button = screen.getByLabelText('Unmute video')

    expect(button).toHaveAttribute('aria-label', 'Unmute video')
    expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  it('has proper button styling', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    const button = screen.getByLabelText('Unmute video')

    expect(button).toHaveClass(
      'h-10', 'w-10', 'rounded-full', 'bg-black/20', 'backdrop-blur-sm',
      'text-white', 'hover:bg-black/40', 'transition-all', 'duration-200',
      'hover:scale-110', 'focus:ring-2', 'focus:ring-white/50'
    )
  })

  it('displays correct icon when muted', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    // Check for mute icon (speaker with X)
    const muteIcon = screen.getByLabelText('Unmute video').querySelector('svg')
    expect(muteIcon).toBeInTheDocument()
  })

  it('displays correct icon when unmuted', () => {
    render(<MuteToggle isMuted={false} onToggle={mockOnToggle} />)

    // Check for unmute icon (speaker)
    const unmuteIcon = screen.getByLabelText('Mute video').querySelector('svg')
    expect(unmuteIcon).toBeInTheDocument()
  })

  it('has focus management with visible focus rings', () => {
    render(<MuteToggle isMuted={true} onToggle={mockOnToggle} />)

    const button = screen.getByLabelText('Unmute video')

    expect(button).toHaveClass('focus:ring-2', 'focus:ring-white/50')
  })
})
