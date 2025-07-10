import { fireEvent, render, screen } from '@testing-library/react'

import { Question } from './Question'

describe('Question', () => {
  const mockProps = {
    question: 'What did you learn from this video?',
    answer:
      'Process what you learned -- Have a private discussion with someone who is ready to listen.',
    isOpen: false,
    onToggle: jest.fn()
  }

  it('renders the question correctly', () => {
    render(<Question {...mockProps} />)

    const helpIcon = screen.getByTestId('HelpSquareContainedIcon')

    expect(screen.getByText(mockProps.question)).toBeInTheDocument()
    expect(helpIcon).toBeInTheDocument()
  })

  it('shows answer when isOpen is true', () => {
    render(<Question {...mockProps} isOpen={true} />)

    expect(screen.getByText(mockProps.answer)).toBeVisible()
  })

  it('calls onToggle when question is clicked', () => {
    render(<Question {...mockProps} />)

    const questionElement = screen.getByText(mockProps.question)
    fireEvent.click(questionElement)

    expect(mockProps.onToggle).toHaveBeenCalledTimes(1)
  })
})
