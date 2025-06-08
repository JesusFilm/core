import { fireEvent, render, screen } from '@testing-library/react'

import { VideoContentFields_studyQuestions } from '../../../__generated__/VideoContentFields'

import { RelatedQuestions } from './RelatedQuestions'

jest.mock('./Question', () => ({
  Question: ({ children, question, isOpen, onToggle }: any) => (
    <div data-testid="question-component">
      <div data-testid="question-text">{question}</div>
      <button data-testid="toggle-button" onClick={onToggle}>
        {'Toggle'}
      </button>
      {isOpen && <div data-testid="question-answer">{children}</div>}
    </div>
  )
}))

describe('RelatedQuestions Component', () => {
  const mockQuestions: VideoContentFields_studyQuestions[] = [
    {
      value: 'Question 1?',
      __typename: 'VideoStudyQuestion'
    },
    {
      value: 'Question 2?',
      __typename: 'VideoStudyQuestion'
    }
  ]

  const mockOnOpenDialog = jest.fn()

  it('renders questions correctly', () => {
    render(
      <RelatedQuestions
        questions={mockQuestions}
        contentId="123"
        questionsTitle="Test Questions"
        askButtonText="Ask Question"
        onOpenDialog={mockOnOpenDialog}
      />
    )

    expect(screen.getByText('Test Questions')).toBeInTheDocument()
    expect(screen.getByText('Ask Question')).toBeInTheDocument()
    expect(screen.getAllByTestId('question-component')).toHaveLength(2)
    expect(screen.getAllByTestId('question-text')[0]).toHaveTextContent(
      'Question 1?'
    )
    expect(screen.getAllByTestId('question-text')[1]).toHaveTextContent(
      'Question 2?'
    )
  })

  it('has the correct link', () => {
    render(
      <RelatedQuestions
        questions={mockQuestions}
        contentId="123"
        questionsTitle="Test Questions"
        askButtonText="Ask Question"
        onOpenDialog={mockOnOpenDialog}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute(
      'href',
      'https://issuesiface.com/talk?utm_source=jesusfilm-watch'
    )
  })

  it('toggles questions when clicked', () => {
    render(
      <RelatedQuestions
        questions={mockQuestions}
        contentId="123"
        questionsTitle="Test Questions"
        askButtonText="Ask Question"
        onOpenDialog={mockOnOpenDialog}
      />
    )

    const toggleButtons = screen.getAllByTestId('toggle-button')

    expect(screen.queryByTestId('question-answer')).not.toBeInTheDocument()

    fireEvent.click(toggleButtons[0])
    expect(screen.getByTestId('question-answer')).toBeInTheDocument()

    fireEvent.click(toggleButtons[1])
    const answers = screen.getAllByTestId('question-answer')
    expect(answers).toHaveLength(1)
  })
})
