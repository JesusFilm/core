import { createInstance } from 'i18next'
import {
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next'

import { LOCALE_MAP, loadJourneyLocaleResources } from './utils'

interface JourneyLocaleProviderProps {
  children: ReactNode
  locale: string
}

/**
 * JourneyI18nProvider creates a separate i18next instance for journey editing components.
 * if you find that resources are not loading, try checking the import paths in the loadJourneyLocaleResources.ts file
 */
export function JourneyLocaleProvider({
  children,
  locale
}: JourneyLocaleProviderProps): ReactElement {
  const [resources, setResources] = useState<
    Record<string, Record<string, any>>
  >({})

  const memoizedLoadResources = useCallback(
    async (directoryLocale: string): Promise<void> => {
      return loadJourneyLocaleResources(locale, setResources, directoryLocale)
    },
    [locale, setResources]
  )

  useEffect(() => {
    const directoryLocale = LOCALE_MAP[locale] || locale
    void memoizedLoadResources(directoryLocale)
  }, [locale, memoizedLoadResources])

  // Create a new i18next instance for this component tree
  const i18nInstance = useMemo(() => {
    const namespaces = ['libs-journeys-ui', 'apps-journeys-admin']
    const instance = createInstance()

    void instance.init({
      lng: locale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      defaultNS: 'libs-journeys-ui',
      ns: namespaces,
      resources
    })

    return instance
  }, [locale, resources])

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
