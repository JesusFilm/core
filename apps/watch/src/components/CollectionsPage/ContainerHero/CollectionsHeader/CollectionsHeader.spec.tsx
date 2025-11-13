import { fireEvent, render, screen } from '@testing-library/react'

import { CollectionsHeader } from './CollectionsHeader'

describe('CollectionsHeader (legacy re-export)', () => {
  it('renders the header with a logo linking to watch', () => {
    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)

    const logo = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(logo).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'JesusFilm Project' })
    expect(link).toHaveAttribute('href', '/watch')
  })

  it('opens language dialog when the button is clicked', () => {
    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)
    fireEvent.click(screen.getByTestId('LanguageButton'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-en')).toBeInTheDocument()
  })
})
