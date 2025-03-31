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

describe('QuizButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('opens the quiz modal when clicked', async () => {
    render(<QuizButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('QuizModal')).toBeInTheDocument()
    })
  })

  it('closes the quiz modal when the close button is clicked', async () => {
    render(<QuizButton />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByTestId('QuizModal')).toBeInTheDocument()
    })

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByTestId('QuizModal')).not.toBeInTheDocument()
    })
  })
})
