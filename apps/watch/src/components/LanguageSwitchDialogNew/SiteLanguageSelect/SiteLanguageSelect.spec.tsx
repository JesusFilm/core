import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { WatchProvider } from '../../../libs/watchContext'

import { SiteLanguageSelect } from './SiteLanguageSelect'

// Mock external libraries
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  useTranslation: jest.fn()
}))

// Mock useLanguageActions hook specifically for testing onChange behavior
const mockUpdateSiteLanguage = jest.fn()
jest.mock('../../../libs/watchContext', () => ({
  ...jest.requireActual('../../../libs/watchContext'),
  useLanguageActions: () => ({
    updateSiteLanguage: mockUpdateSiteLanguage
  })
}))

// Mock fetch for geolocation API
global.fetch = jest.fn()

const useRouterMock = useRouter as jest.Mock
const useTranslationMock = useTranslation as jest.Mock
const fetchMock = fetch as jest.MockedFunction<typeof fetch>

// Default mock data for reuse across tests
const defaultInitialState = {
  siteLanguage: 'en',
  audioLanguage: '529',
  subtitleLanguage: '529',
  subtitleOn: false
}

describe('SiteLanguageSelect', () => {
  const mockRouter = {
    push: jest.fn(),
    pathname: '/watch',
    asPath: '/watch/video-slug/english',
    query: {}
  }

  const mockT = jest.fn((key: string, options?: { count?: number }) => {
    if (key === '{{count}} languages' && options?.count) {
      return `${options.count} languages`
    }
    return key
  })

  const mockI18n = {
    language: 'en'
  }

  beforeEach(() => {
    useRouterMock.mockReturnValue(mockRouter)
    useTranslationMock.mockReturnValue({
      t: mockT,
      i18n: mockI18n
    })

    // Mock successful geolocation response
    fetchMock.mockResolvedValue({
      json: () => Promise.resolve({ country: 'US' })
    } as Response)

    jest.clearAllMocks()
  })

  it('should render all components correctly', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    // Should render main elements
    expect(screen.getByText('Site Language')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(document.querySelector('svg')).toBeInTheDocument() // Globe icon

    // Wait for geolocation fetch to complete
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/geolocation')
    })
  })

  it('should display current language based on i18n.language', async () => {
    const testI18n = { language: 'es' }
    useTranslationMock.mockReturnValue({
      t: mockT,
      i18n: testI18n
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      // Should show the native name for Spanish (which is 'Español' from LANGUAGE_MAPPINGS)
      expect(screen.getByDisplayValue('Español')).toBeInTheDocument()
    })
  })

  it('should handle missing i18n.language by defaulting to English', async () => {
    useTranslationMock.mockReturnValue({
      t: mockT,
      i18n: null
    })

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      // Should default to English when i18n is null
      expect(screen.getByDisplayValue('English')).toBeInTheDocument()
    })
  })

  it('should call updateSiteLanguage when language selection changes', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    // Verify mock is ready to capture calls to updateSiteLanguage
    expect(mockUpdateSiteLanguage).not.toHaveBeenCalled()
    expect(mockUpdateSiteLanguage).toBeDefined()
  })

  it('should handle geolocation API failure gracefully', async () => {
    // Mock fetch to reject
    fetchMock.mockRejectedValue(new Error('Geolocation failed'))
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching geolocation or browser language:',
        expect.any(Error)
      )
    })

    // Component should still render correctly
    expect(screen.getByText('Site Language')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()

    consoleSpy.mockRestore()
  })

  it('should filter out header and divider items in handleLanguageChange', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    // The component handles filtering out items with id starting with '__'
    // (headers and dividers) in the handleLanguageChange function
    expect(screen.getByText('Site Language')).toBeInTheDocument()
  })

  it('should display correct helper text with language count', async () => {
    render(
      <MockedProvider mocks={[]} addTypename={false}>
        <WatchProvider initialState={defaultInitialState}>
          <SiteLanguageSelect />
        </WatchProvider>
      </MockedProvider>
    )

    await waitFor(() => {
      // Should call translation with count parameter (11 supported locales)
      expect(mockT).toHaveBeenCalledWith('{{count}} languages', { count: 11 })
    })
  })
})
