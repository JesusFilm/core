import { fireEvent, render, screen } from '@testing-library/react'

import { Question } from './Question'

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn().mockReturnValue({
    t: (key: string) => key
  })
}))

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
            __typename: 'VideoStudyQuestion',
            primary: true
          }
        ]}
      />
    )

    fireEvent.click(screen.getByText('What did you learn from this video?'))

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

  it('hides the content when the question is closed', () => {
    render(
      <Question
        questions={[
          {
            value: 'What did you learn from this video?',
            __typename: 'VideoStudyQuestion',
            primary: true
          }
        ]}
      />
    )

    expect(
      screen.queryByText(
        'Have a private discussion with someone who is ready to listen.'
      )
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Chat with a person' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Ask a Bible question' })
    ).not.toBeInTheDocument()

    fireEvent.click(screen.getByText('What did you learn from this video?'))

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
            __typename: 'VideoStudyQuestion',
            primary: true
          }
        ]}
      />
    )
    fireEvent.click(screen.getByText('What did you learn from this video?'))

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
            __typename: 'VideoStudyQuestion',
            primary: true
          }
        ]}
      />
    )
    fireEvent.click(screen.getByText('What did you learn from this video?'))

    fireEvent.click(
      screen.getByRole('button', { name: 'Ask a Bible question' })
    )
    expect(window.open).toHaveBeenCalledWith(
      'https://www.everystudent.com/contact.php?utm_source=jesusfilm-watch',
      '_blank'
    )
  })
})
