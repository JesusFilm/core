import { render, screen, waitFor } from '@testing-library/react'
import { createInstance } from 'i18next'
import { type MockedFunction } from 'vitest'

import { JourneyLocaleProvider } from './JourneyLocaleProvider'
import { LOCALE_MAP, loadJourneyLocaleResources } from './utils'

vi.mock('./utils', () => ({
  __esModule: true,
  loadJourneyLocaleResources: vi.fn(),
  LOCALE_MAP: {
    en: 'en',
    ko: 'ko-KR',
    'zh-hans': 'zh-Hans-CN',
    es: 'es-ES',
    fr: 'fr-FR',
    hi: 'hi-IN',
    ar: 'ar-SA',
    ru: 'ru-RU',
    th: 'th-TH',
    id: 'id-ID',
    ja: 'ja-JP',
    bn: 'bn-BD',
    am: 'am-ET',
    tl: 'tl-PH',
    tr: 'tr-TR',
    ur: 'ur-PK',
    vi: 'vi-VN',
    my: 'my-MM'
  }
}))

const init = vi.fn()
const mockI18nInstance = {
  init,
  language: 'en',
  isInitialized: true,
  t: vi.fn((key) => key)
}

vi.mock('i18next', () => ({
  __esModule: true,
  createInstance: vi.fn()
}))

const mockCreateInstance = createInstance as MockedFunction<
  typeof createInstance
>

const mockedLoadJourneyLocaleResources =
  loadJourneyLocaleResources as MockedFunction<
    typeof loadJourneyLocaleResources
  >
const mockedCreateInstance = createInstance as MockedFunction<
  typeof createInstance
>

describe('JourneyLocaleProvider', () => {
  const TestChildComponent = () => <div>Test Child</div>
  const defaultNamespaces = ['libs-journeys-ui', 'apps-journeys-admin']

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateInstance.mockReturnValue(mockI18nInstance as any)

    mockedLoadJourneyLocaleResources.mockImplementation(
      async (locale, setResources, _directoryLocale) => {
        const mockResources = {
          [locale]: {
            'libs-journeys-ui': { testKey: `ui loaded for ${locale}` },
            'apps-journeys-admin': { testKey: `admin loaded for ${locale}` }
          }
        }
        setResources(mockResources)
      }
    )
  })

  test('should render children and load resources for a locale not in LOCALE_MAP', async () => {
    const locale = 'de'
    render(
      <JourneyLocaleProvider locale={locale}>
        <TestChildComponent />
      </JourneyLocaleProvider>
    )

    expect(screen.getByText('Test Child')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockedLoadJourneyLocaleResources).toHaveBeenCalledWith(
        locale,
        expect.any(Function),
        locale
      )
    })

    // Check i18next instance creation and initialization
    expect(mockedCreateInstance).toHaveBeenCalled()
    await waitFor(() => {
      expect(mockI18nInstance.init).toHaveBeenCalledWith({
        lng: locale,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        defaultNS: 'libs-journeys-ui',
        ns: defaultNamespaces,
        resources: {
          [locale]: {
            'libs-journeys-ui': { testKey: `ui loaded for ${locale}` },
            'apps-journeys-admin': { testKey: `admin loaded for ${locale}` }
          }
        }
      })
    })
  })

  test('should use LOCALE_MAP to determine directoryLocale for resource loading', async () => {
    const locale = 'ko'
    const expectedDirectoryLocale = 'ko-KR'

    render(
      <JourneyLocaleProvider locale={locale}>
        <TestChildComponent />
      </JourneyLocaleProvider>
    )

    await waitFor(() => {
      expect(mockedLoadJourneyLocaleResources).toHaveBeenCalledTimes(1)
      expect(mockedLoadJourneyLocaleResources).toHaveBeenCalledWith(
        locale,
        expect.any(Function),
        expectedDirectoryLocale
      )
    })

    await waitFor(() => {
      expect(mockI18nInstance.init).toHaveBeenCalledWith(
        expect.objectContaining({
          lng: locale,
          resources: {
            [locale]: {
              'libs-journeys-ui': { testKey: `ui loaded for ${locale}` },
              'apps-journeys-admin': { testKey: `admin loaded for ${locale}` }
            }
          }
        })
      )
    })
  })

  test('should reload resources and reinitialize i18n when locale prop changes', async () => {
    const initialLocale = 'en'
    const { rerender } = render(
      <JourneyLocaleProvider locale={initialLocale}>
        <TestChildComponent />
      </JourneyLocaleProvider>
    )

    const newLocale = 'fr'
    // Update mock for the new locale load
    mockedLoadJourneyLocaleResources.mockImplementationOnce(
      async (locale, setResources, _directoryLocale) => {
        setResources({
          [newLocale]: {
            'libs-journeys-ui': { testKey: `ui loaded for ${newLocale}` },
            'apps-journeys-admin': { testKey: `admin loaded for ${newLocale}` }
          }
        })
      }
    )

    rerender(
      <JourneyLocaleProvider locale={newLocale}>
        <TestChildComponent />
      </JourneyLocaleProvider>
    )

    await waitFor(() => {
      expect(mockedLoadJourneyLocaleResources).toHaveBeenLastCalledWith(
        newLocale,
        expect.any(Function),
        LOCALE_MAP[newLocale] || newLocale
      )
    })

    await waitFor(() => {
      expect(mockI18nInstance.init).toHaveBeenLastCalledWith(
        expect.objectContaining({
          lng: newLocale,
          resources: {
            [newLocale]: {
              'libs-journeys-ui': { testKey: `ui loaded for ${newLocale}` },
              'apps-journeys-admin': {
                testKey: `admin loaded for ${newLocale}`
              }
            }
          }
        })
      )
    })
  })
})
