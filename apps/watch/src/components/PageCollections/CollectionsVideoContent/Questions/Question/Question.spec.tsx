import { fireEvent, render, screen } from '@testing-library/react'

import { Question } from './Question'

describe('Question Component', () => {
  const defaultProps = {
    question: 'Test Question?',
    isOpen: false,
    onToggle: jest.fn(),
    children: <p data-testid="test-children">{'Test Answer'}</p>
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with the provided question text', () => {
    render(<Question {...defaultProps} />)

    expect(screen.getByText('Test Question?')).toBeInTheDocument()
  })

  it('calls onToggle when the button is clicked', () => {
    render(<Question {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(defaultProps.onToggle).toHaveBeenCalledTimes(1)
  })

  it('does not display children content when isOpen is false', () => {
    render(<Question {...defaultProps} isOpen={false} />)

    expect(screen.queryByTestId('test-children')).not.toBeInTheDocument()
  })

  it('displays children content when isOpen is true', () => {
    render(<Question {...defaultProps} isOpen={true} />)

    expect(screen.getByTestId('test-children')).toBeInTheDocument()
  })
})
