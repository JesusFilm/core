import { fireEvent, render, screen } from '@testing-library/react'

import { QuizPopup } from '../QuizPopup'

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('QuizPopup', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders when open', () => {
    render(<QuizPopup isOpen onClose={mockOnClose} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<QuizPopup isOpen={false} onClose={mockOnClose} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when dialog is closed', () => {
    render(<QuizPopup isOpen onClose={mockOnClose} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalled()
  })
})
