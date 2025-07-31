import { render, screen } from '@testing-library/react'

import { VideoContentFields_studyQuestions } from '../../../../__generated__/VideoContentFields'

import { DiscussionQuestions } from './DiscussionQuestions'

describe('DiscussionQuestions', () => {
  const mockQuestions: VideoContentFields_studyQuestions[] = [
    {
      value: 'What did you learn from this video?',
      __typename: 'VideoStudyQuestion'
    },
    {
      value: 'How can you apply this in your life?',
      __typename: 'VideoStudyQuestion'
    }
  ]

  it('renders the component with questions', () => {
    render(<DiscussionQuestions questions={mockQuestions} />)

    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(screen.getByText('Related questions')).toBeInTheDocument()
    expect(screen.getByText('Ask yours')).toBeInTheDocument()
    expect(screen.getByTestId('AskQuestionButton')).toBeInTheDocument()

    // Check if questions are rendered
    mockQuestions.forEach((question) => {
      expect(screen.getByText(question.value)).toBeInTheDocument()
    })
  })
})
