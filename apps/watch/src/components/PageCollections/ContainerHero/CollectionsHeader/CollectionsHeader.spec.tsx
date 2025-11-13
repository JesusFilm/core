import { fireEvent, render, screen } from '@testing-library/react'

import { CollectionsHeader } from './CollectionsHeader'

describe('CollectionsHeader', () => {
  it('renders the header with a logo linking to watch', () => {
    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)

    const logo = screen.getByRole('img', { name: 'JesusFilm Project' })
    expect(logo).toBeInTheDocument()

    const link = screen.getByRole('link', { name: 'JesusFilm Project' })
    expect(link).toHaveAttribute('href', '/watch')
  })

  it('opens language dialog when the button is clicked', () => {
    render(<CollectionsHeader feedbackButtonLabel="Feedback" />)

    const languageButton = screen.getByTestId('LanguageButton')
    fireEvent.click(languageButton)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-en')).toBeInTheDocument()
  })

  it('renders support link inside the language dialog', () => {
    render(<CollectionsHeader feedbackButtonLabel="Contact us" />)

    fireEvent.click(screen.getByTestId('LanguageButton'))
    const supportLink = screen.getByTestId('language-button-support')
    expect(supportLink).toHaveTextContent('Contact us')
    expect(supportLink).toHaveAttribute('href', '/contact')
  })
})
