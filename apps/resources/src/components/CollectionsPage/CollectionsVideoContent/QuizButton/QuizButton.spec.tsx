import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { QuizButton } from './QuizButton'

vi.mock('react-i18next', async () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

vi.mock('@next/third-parties/google', async () => ({
  sendGTMEvent: vi.fn()
}))

describe('QuizButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    const closeButton = screen.getByRole('button', { name: 'close' })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('QuizModal')).not.toBeInTheDocument()
    })
  })
})
