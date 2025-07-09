import { fireEvent, render, screen } from '@testing-library/react'

import { VideoContentFields_studyQuestions as StudyQuestions } from '../../../../../__generated__/VideoContentFields'

import { Question } from './Question'

describe('Question', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.open = jest.fn()
  })

  it('renders the questions correcttly', () => {
    render(
      <Question
        questions={[
          {
            value: 'What did you learn from this video?',
            __typename: 'VideoStudyQuestion'
          }
        ]}
      />
    )

    expect(
      screen.getByText(
        'Have a private discussion with someone who is ready to listen.'
      )
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Chat with a person' })
    ).toBeVisible()
    expect(
      screen.getByRole('button', { name: 'Ask a Bible question' })
    ).toBeVisible()
  })

  it('opens chat link in a new tab when chat button is clicked', () => {
    render(
      <Question
        questions={[
          {
            value: 'What did you learn from this video?',
            __typename: 'VideoStudyQuestion'
          }
        ]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Chat with a person' }))
    expect(window.open).toHaveBeenCalledWith(
      'https://chataboutjesus.com/chat/?utm_source=jesusfilm-watch',
      '_blank'
    )
  })

  it('opens bible question link in a new tab when bible question button is clicked', () => {
    render(
      <Question
        questions={[
          {
            value: 'What did you learn from this video?',
            __typename: 'VideoStudyQuestion'
          }
        ]}
      />
    )

    fireEvent.click(
      screen.getByRole('button', { name: 'Ask a Bible question' })
    )
    expect(window.open).toHaveBeenCalledWith(
      'https://www.everystudent.com/contact.php?utm_source=jesusfilm-watch',
      '_blank'
    )
  })
})
