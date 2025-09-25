import { fireEvent, render, screen, within } from '@testing-library/react'

import { VideoContentFields_studyQuestions } from '../../../../__generated__/VideoContentFields'

import { DiscussionQuestions } from './DiscussionQuestions'

describe('DiscussionQuestions', () => {
  const mockQuestions: VideoContentFields_studyQuestions[] = [
    {
      value: 'What did you learn from this video?',
      __typename: 'VideoStudyQuestion',
      primary: true
    },
    {
      value: 'How can you apply this in your life?',
      __typename: 'VideoStudyQuestion',
      primary: true
    }
  ]

  it('renders the component with questions', () => {
    render(<DiscussionQuestions questions={mockQuestions} />)

    expect(screen.getByTestId('ContentDiscussionQuestions')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Related questions' })
    ).toBeInTheDocument()
    expect(screen.getByText('Ask yours')).toBeInTheDocument()
    expect(screen.getByTestId('AskQuestionButton')).toBeInTheDocument()

    const discussionPanel = screen.getByRole('tabpanel', {
      name: 'Related questions'
    })

    // Check if questions are rendered
    mockQuestions.forEach((question) => {
      expect(
        within(discussionPanel).getByText(question.value)
      ).toBeInTheDocument()
    })

    expect(
      screen.getByRole('tab', { name: 'Related questions' })
    ).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tab', { name: 'Sharing Ideas' })).toHaveAttribute(
      'aria-selected',
      'false'
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Sharing Ideas' }))

    expect(screen.getByRole('tab', { name: 'Sharing Ideas' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByTestId('SharingIdeasWall')).toBeInTheDocument()
  })
})
