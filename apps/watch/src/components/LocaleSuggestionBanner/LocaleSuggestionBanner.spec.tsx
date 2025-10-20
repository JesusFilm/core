import { fireEvent, render, screen } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { usePreferredLocale } from '../../libs/locale'
import { LANGUAGE_MAPPINGS } from '../../libs/localeMapping'

import { LocaleSuggestionBanner } from './LocaleSuggestionBanner'

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

jest.mock('../../libs/locale', () => ({
  usePreferredLocale: jest.fn()
}))

describe('LocaleSuggestionBanner', () => {
  const mockPush = jest.fn()
  const mockRouter = {
    asPath: '/watch',
    locale: 'en',
    defaultLocale: 'en',
    push: mockPush
  }

  const renderBanner = () => render(<LocaleSuggestionBanner />)

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
    ;(useTranslation as jest.Mock).mockReturnValue({
      t: (key: string, options?: Record<string, string>) => {
        const name = options?.localeName ?? ''
        if (key === 'localeSuggestion.message') {
          return `Message ${name}`
        }
        if (key === 'localeSuggestion.action') {
          return `Switch ${name}`
        }
        return key
      }
    })
  })

  it('does not render when no preferred locale is found', () => {
    ;(usePreferredLocale as jest.Mock).mockReturnValue(undefined)

    renderBanner()

    expect(
      screen.queryByTestId('LocaleSuggestionBanner')
    ).not.toBeInTheDocument()
  })

  it('does not render when preferred locale matches current locale', () => {
    ;(usePreferredLocale as jest.Mock).mockReturnValue('en')

    renderBanner()

    expect(
      screen.queryByTestId('LocaleSuggestionBanner')
    ).not.toBeInTheDocument()
  })

  it('renders when locales differ and navigates on action click', () => {
    ;(usePreferredLocale as jest.Mock).mockReturnValue('es')

    renderBanner()

    const banner = screen.getByTestId('LocaleSuggestionBanner')
    expect(banner).toBeInTheDocument()

    const { nativeName } = LANGUAGE_MAPPINGS.es

    expect(screen.getByText(`Message ${nativeName}`)).toBeInTheDocument()

    const actionButton = screen.getByRole('button', {
      name: `Switch ${nativeName}`
    })

    fireEvent.click(actionButton)

    expect(mockPush).toHaveBeenCalledWith('/watch', '/watch', {
      locale: 'es'
    })
  })
})
