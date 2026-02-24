import { fireEvent, render, screen } from '@testing-library/react'

import { QuizModal } from './QuizModal'

describe('QuizModal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  test('should render when open is true', () => {
    render(<QuizModal open={true} onClose={mockOnClose} />)

    const modal = screen.getByTestId('QuizModal')
    expect(modal).toBeInTheDocument()
    expect(modal).toBeVisible()
  })

  test('should render iframe with correct source', () => {
    render(<QuizModal open={true} onClose={mockOnClose} />)

    const iframe = screen.getByTestId('QuizIframe')
    expect(iframe).toBeInTheDocument()
    expect(iframe).toHaveAttribute(
      'src',
      'https://your.nextstep.is/embed/easter2025?expand=false'
    )
    expect(iframe).toHaveClass('border-0 w-full h-full')
  })

  test('should call onClose when close button is clicked', () => {
    render(<QuizModal open onClose={mockOnClose} />)

    const closeButton = screen.getByRole('button', { name: 'close' })
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  test('should call onClose when escape key is pressed', () => {
    render(<QuizModal open onClose={mockOnClose} />)

    fireEvent.keyDown(document, {
      key: 'Escape',
      code: 'Escape'
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })
})
