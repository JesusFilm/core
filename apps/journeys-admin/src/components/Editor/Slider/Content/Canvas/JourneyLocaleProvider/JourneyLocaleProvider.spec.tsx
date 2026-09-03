import { render, screen, waitFor } from '@testing-library/react'
import { createInstance } from 'i18next'
import { type MockedFunction } from 'vitest'

import { JourneyLocaleProvider } from './JourneyLocaleProvider'
import { loadJourneyLocaleResources } from './utils'

vi.mock('./utils', () => ({
  __esModule: true,
  loadJourneyLocaleResources: vi.fn()
}))

const init = vi.fn()
const addResourceBundle = vi.fn()
const mockI18nInstance = {
  init,
  addResourceBundle,
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

  // The bundles are handed over deep-merged and overwriting, so every
  // assertion below carries the same trailing `true, true`.
  const expectBundleAdded = (
    locale: string,
    namespace: string,
    testKey: string
  ) =>
    expect(mockI18nInstance.addResourceBundle).toHaveBeenCalledWith(
      locale,
      namespace,
      { testKey },
      true,
      true
    )

  const expectBundleAddedLast = (
    locale: string,
    namespace: string,
    testKey: string
  ) =>
    expect(mockI18nInstance.addResourceBundle).toHaveBeenLastCalledWith(
      locale,
      namespace,
      { testKey },
      true,
      true
    )

  beforeEach(() => {
    vi.clearAllMocks()
    mockCreateInstance.mockReturnValue(mockI18nInstance as any)

    mockedLoadJourneyLocaleResources.mockImplementation(
      async (locale, setResources) => {
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

  test('should render children and load resources for the locale', async () => {
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
        expect.any(Function)
      )
    })

    // The instance is created before its resources exist, so it initialises
    // empty and is handed the bundles once they arrive.
    expect(mockedCreateInstance).toHaveBeenCalled()
    expect(mockI18nInstance.init).toHaveBeenCalledWith({
      lng: locale,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      defaultNS: 'libs-journeys-ui',
      ns: defaultNamespaces,
      resources: {},
      react: { bindI18nStore: 'added' }
    })

    await waitFor(() =>
      expectBundleAdded(locale, 'libs-journeys-ui', `ui loaded for ${locale}`)
    )
    expectBundleAdded(
      locale,
      'apps-journeys-admin',
      `admin loaded for ${locale}`
    )
  })

  test('should load resources once and key the i18n instance by the locale', async () => {
    const locale = 'ko'

    render(
      <JourneyLocaleProvider locale={locale}>
        <TestChildComponent />
      </JourneyLocaleProvider>
    )

    await waitFor(() => {
      expect(mockedLoadJourneyLocaleResources).toHaveBeenCalledTimes(1)
      expect(mockedLoadJourneyLocaleResources).toHaveBeenCalledWith(
        locale,
        expect.any(Function)
      )
    })

    // Resources arriving must not re-init the instance: consumers keep the `t`
    // they were handed, so a replacement instance would strand them on the
    // empty one.
    expect(mockI18nInstance.init).toHaveBeenCalledTimes(1)
    expect(mockI18nInstance.init).toHaveBeenCalledWith(
      expect.objectContaining({ lng: locale })
    )

    await waitFor(() =>
      expectBundleAdded(locale, 'libs-journeys-ui', `ui loaded for ${locale}`)
    )
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
      async (locale, setResources) => {
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
        expect.any(Function)
      )
    })

    expect(mockI18nInstance.init).toHaveBeenLastCalledWith(
      expect.objectContaining({ lng: newLocale, resources: {} })
    )

    await waitFor(() =>
      expectBundleAddedLast(
        newLocale,
        'apps-journeys-admin',
        `admin loaded for ${newLocale}`
      )
    )
  })
})
