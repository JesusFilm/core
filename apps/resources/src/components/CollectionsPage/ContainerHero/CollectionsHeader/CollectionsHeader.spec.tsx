import useScrollTrigger from '@mui/material/useScrollTrigger'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CollectionsHeader } from './CollectionsHeader'

// Mock the useScrollTrigger hook
jest.mock('@mui/material/useScrollTrigger')

describe('CollectionsHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the header with a logo', () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(false)

    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)

    const header = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(header).toBeInTheDocument()

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://www.jesusfilm.org/watch')
  })

  it('opens language modal when language button is clicked and closes when close button is clicked', async () => {
    ;(useScrollTrigger as jest.Mock).mockReturnValue(false)

    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)

    const languageButton = screen.getByTestId('LanguageButton')
    expect(languageButton).toBeInTheDocument()

    fireEvent.click(languageButton)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()

    const closeButton = screen.getByTestId('CloseLanguageButton')
    expect(closeButton).toBeInTheDocument()

    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(
        screen.queryByTestId('CloseLanguageButton')
      ).not.toBeInTheDocument()
    })
  })
})
