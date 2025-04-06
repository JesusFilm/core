import { fireEvent, render, screen } from '@testing-library/react'

import { LanguageModal } from './LanguageModal'

describe('LanguageModal', () => {
  const mockOnClose = jest.fn()
  const feedbackButtonLabel = 'Contact Support'

  let originalHref: string

  beforeEach(() => {
    jest.clearAllMocks()
    originalHref = window.location.href

    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: 'http://example.com'
      },
      writable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        href: originalHref
      },
      writable: true
    })
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

  it('calls handleLanguageSelect with correct URL when a language is selected', () => {
    const hrefSetter = jest.fn()
    Object.defineProperty(window.location, 'href', {
      get: () => 'http://example.com',
      set: hrefSetter
    })

    render(
      <LanguageModal
        open={true}
        onClose={mockOnClose}
        feedbackButtonLabel={feedbackButtonLabel}
      />
    )

    const englishButton = screen.getByTestId('language-button-en')
    fireEvent.click(englishButton)

    expect(hrefSetter).toHaveBeenCalledWith('/easter/english')
    expect(mockOnClose).toHaveBeenCalledTimes(1)
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
