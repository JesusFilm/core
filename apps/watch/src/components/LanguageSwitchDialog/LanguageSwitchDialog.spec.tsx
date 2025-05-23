import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { LanguageSwitchDialog } from './LanguageSwitchDialog'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock next-i18next
jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

describe('LanguageSwitchDialog', () => {
  const mockHandleClose = jest.fn()
  const mockRouter = {
    asPath: '/test-path',
    push: jest.fn(),
    reload: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        options: {
          locales: ['en', 'es', 'fr', 'de']
        },
        changeLanguage: jest.fn()
      }
    })
  })

  it('renders language buttons for supported languages', () => {
    render(<LanguageSwitchDialog open={true} handleClose={mockHandleClose} />)

    expect(screen.getByTestId('language-button-en')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-es')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-fr')).toBeInTheDocument()
    expect(screen.getByTestId('language-button-de')).toBeInTheDocument()
  })

  it('handles language change correctly', () => {
    const mockChangeLanguage = jest.fn()
    ;(useTranslation as jest.Mock).mockReturnValue({
      t: (key: string) => key,
      i18n: {
        language: 'en',
        options: {
          locales: ['en', 'es', 'fr', 'de']
        },
        changeLanguage: mockChangeLanguage
      }
    })

    render(<LanguageSwitchDialog open={true} handleClose={mockHandleClose} />)

    const spanishButton = screen.getByTestId('language-button-es')
    fireEvent.click(spanishButton)

    expect(mockChangeLanguage).toHaveBeenCalledWith('es')
    expect(mockRouter.reload).toHaveBeenCalled()
  })

  it('renders contact button with correct link', () => {
    render(<LanguageSwitchDialog open={true} handleClose={mockHandleClose} />)

    const contactButton = screen.getByTestId('language-button-support')
    expect(contactButton).toHaveAttribute('href', '/contact')
  })

  it('calls handleClose when close button is clicked', () => {
    render(<LanguageSwitchDialog open={true} handleClose={mockHandleClose} />)

    const closeButton = screen.getByTestId('CloseLanguageButton')
    fireEvent.click(closeButton)

    expect(mockHandleClose).toHaveBeenCalled()
  })

  it('does not render when open is false', () => {
    render(<LanguageSwitchDialog open={false} handleClose={mockHandleClose} />)

    expect(screen.queryByTestId('language-button-en')).not.toBeInTheDocument()
  })
})
