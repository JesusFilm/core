import { render, screen, fireEvent } from '@testing-library/react'
import { ArrowNav } from './ArrowNav'

describe('ArrowNav', () => {
  const mockOnPrev = jest.fn()
  const mockOnNext = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders both arrow buttons', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    expect(screen.getByLabelText('Previous video')).toBeInTheDocument()
    expect(screen.getByLabelText('Next video')).toBeInTheDocument()
  })

  it('calls onPrev when previous button is clicked', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    fireEvent.click(screen.getByLabelText('Previous video'))

    expect(mockOnPrev).toHaveBeenCalledTimes(1)
  })

  it('calls onNext when next button is clicked', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    fireEvent.click(screen.getByLabelText('Next video'))

    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })

  it('has proper accessibility attributes', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    const prevButton = screen.getByLabelText('Previous video')
    const nextButton = screen.getByLabelText('Next video')

    expect(prevButton).toHaveAttribute('aria-label', 'Previous video')
    expect(nextButton).toHaveAttribute('aria-label', 'Next video')
  })

  it('has focus management with visible focus rings', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    const prevButton = screen.getByLabelText('Previous video')
    const nextButton = screen.getByLabelText('Next video')

    expect(prevButton).toHaveClass('focus:ring-2', 'focus:ring-white/50')
    expect(nextButton).toHaveClass('focus:ring-2', 'focus:ring-white/50')
  })

  it('has proper button styling and hover effects', () => {
    render(<ArrowNav onPrev={mockOnPrev} onNext={mockOnNext} />)

    const prevButton = screen.getByLabelText('Previous video')
    const nextButton = screen.getByLabelText('Next video')

    expect(prevButton).toHaveClass(
      'h-12', 'w-12', 'rounded-full', 'bg-black/20', 'backdrop-blur-sm',
      'text-white', 'hover:bg-black/40', 'transition-all', 'duration-200',
      'hover:scale-110'
    )
    expect(nextButton).toHaveClass(
      'h-12', 'w-12', 'rounded-full', 'bg-black/20', 'backdrop-blur-sm',
      'text-white', 'hover:bg-black/40', 'transition-all', 'duration-200',
      'hover:scale-110'
    )
  })
})
