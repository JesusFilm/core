import { createInstance } from 'i18next'
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import { I18nextProvider } from 'react-i18next'

interface JourneyI18nProviderProps {
  children: ReactNode
  locale: string
}

const LOCALE_MAP = {
  en: 'en',
  ko: 'ko-KR',
  zh: 'zh-Hans-CN',
  'zh-Hant': 'zh-Hant-TW',
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

/**
 * JourneyI18nProvider creates a separate i18next instance for journey editing components.
 */
export function JourneyI18nProvider({
  children,
  locale
}: JourneyI18nProviderProps): ReactElement {
  const [resources, setResources] = useState<
    Record<string, Record<string, any>>
  >({})
  const [isLoading, setIsLoading] = useState(locale !== 'en')

  async function loadResources(directoryLocale: string): Promise<void> {
    try {
      const [adminResources, uiResources] = await Promise.all([
        import(
          /* webpackChunkName: "locale-[request]" */
          `../../../../../../../../libs/locales/${directoryLocale}/apps-journeys-admin.json`
        ),
        import(
          /* webpackChunkName: "locale-[request]" */
          `../../../../../../../../libs/locales/${directoryLocale}/libs-journeys-ui.json`
        )
      ])

      setResources({
        [locale]: {
          'apps-journeys-admin': adminResources.default || adminResources,
          'libs-journeys-ui': uiResources.default || uiResources
        }
      })
      console.log(
        `Loaded ${locale} (${directoryLocale}) resources successfully`
      )
    } catch (error) {
      console.error(
        `Error loading locale resources for ${locale} (${directoryLocale}):`,
        error
      )
    } finally {
      setIsLoading(false)
    }
  }

  console.log('locale set on journey:', locale)

  // Dynamically load resources for the selected locale
  useEffect(() => {
    // Skip loading for English as it's the default
    if (locale === 'en') {
      setIsLoading(false)
      return
    }

    // Hard-coded locale map to match directory structure in libs/locales

    const directoryLocale = LOCALE_MAP[locale] || locale
    setIsLoading(true)

    void loadResources(directoryLocale)
  }, [locale])

  // Using dynamic imports instead of require

  // Create a new i18next instance for this component tree
  const i18nInstance = useMemo(() => {
    // Define namespaces
    const namespaces = ['apps-journeys-admin', 'libs-journeys-ui']

    // Create a new instance
    const instance = createInstance()

    // Initialize with config
    void instance.init({
      lng: locale,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      defaultNS: 'apps-journeys-admin',
      ns: namespaces,
      resources
    })

    return instance
  }, [locale, resources])

  if (isLoading) {
    return <div>Loading translations...</div>
  }

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
