import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { QuizButton } from './QuizButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: jest.fn()
}))

describe('QuizButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the quiz button correctly', () => {
    render(
      <QuizButton
        buttonText="What's your next step of faith?"
        contentId="123"
      />
    )

    expect(screen.getByText('Quiz')).toBeInTheDocument()
    expect(
      screen.getByText("What's your next step of faith?")
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Open faith quiz' })
    ).toBeInTheDocument()
  })

  it('opens the quiz modal when clicked', async () => {
    render(
      <QuizButton
        buttonText="What's your next step of faith?"
        contentId="123"
      />
    )

    const button = screen.getByRole('button', { name: 'Open faith quiz' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('QuizModal')).toBeInTheDocument()
    })
  })

  it('closes the quiz modal when the close button is clicked', async () => {
    render(
      <QuizButton
        buttonText="What's your next step of faith?"
        contentId="123"
      />
    )

    const button = screen.getByRole('button', { name: 'Open faith quiz' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('QuizModal')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button', { name: 'close quiz' })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('QuizModal')).not.toBeInTheDocument()
    })
  })
})
