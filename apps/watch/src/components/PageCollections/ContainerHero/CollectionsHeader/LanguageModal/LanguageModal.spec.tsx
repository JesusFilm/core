import { fireEvent, render, screen } from '@testing-library/react'

import { LanguageModal } from './LanguageModal'

describe('LanguageModal', () => {
  const mockOnClose = jest.fn()
  const feedbackButtonLabel = 'Contact Support'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when open is true', () => {
    render(
      <LanguageModal
        open={true}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    const dialog = screen.getByTestId('LanguageModal')
    expect(dialog).toBeInTheDocument()

    expect(screen.getByTestId('language-button-en')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-fr')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-es')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-pt')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-ru')).toBeInTheDocument()

    expect(screen.getByTestId('CloseLanguageButton')).toBeInTheDocument()

    const supportButton = screen.getByTestId('language-button-support')
    expect(supportButton).toBeInTheDocument()
    expect(supportButton).toHaveTextContent(feedbackButtonLabel)
  })

  it('does not render when open is false', () => {
    render(
      <LanguageModal
        open={false}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    expect(screen.queryByTestId('language-button-en')).not.toBeInTheDocument()
    expect(screen.queryByTestId('CloseLanguageButton')).not.toBeInTheDocument()
  })

  it('calls onClose when the close button is clicked', () => {
    render(
      <LanguageModal
        open={true}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    const closeButton = screen.getByTestId('CloseLanguageButton')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('has correct href when a language is selected', () => {
    render(
      <LanguageModal
        open={true}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    const englishButton = screen.getByTestId('language-button-en')
    expect(englishButton).toHaveAttribute('href', '/watch/easter/english')

    const frenchButton = screen.getByTestId('language-button-fr')
    expect(frenchButton).toHaveAttribute('href', '/watch/easter/french')

    const spanishButton = screen.getByTestId('language-button-es')
    expect(spanishButton).toHaveAttribute(
      'href',
      '/watch/easter/spanish-latin-american'
    )
  })

  it('has a link to the contact page', () => {
    render(
      <LanguageModal
        open={true}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    const supportButton = screen.getByTestId('language-button-support')
    expect(supportButton).toHaveAttribute('href', '/contact')
  })
})
