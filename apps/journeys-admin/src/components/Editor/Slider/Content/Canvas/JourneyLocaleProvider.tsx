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

interface JourneyLocaleProviderProps {
  children: ReactNode
  locale: string
}

const LOCALE_MAP = {
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

/**
 * JourneyI18nProvider creates a separate i18next instance for journey editing components.
 */
export function JourneyLocaleProvider({
  children,
  locale
}: JourneyLocaleProviderProps): ReactElement {
  const [resources, setResources] = useState<
    Record<string, Record<string, any>>
  >({})
  const loadResources = useCallback(
    async (directoryLocale: string): Promise<void> => {
      try {
        const uiResources = await import(
          /* webpackChunkName: "locale-[request]" */
          `../../../../../../../../libs/locales/${directoryLocale}/libs-journeys-ui.json`
        )
        // Map directoryLocale to i18n locale key
        let i18nLocale: string | null = null
        if (directoryLocale === 'zh-Hans-CN') {
          i18nLocale = 'zh-Hans'
        }

        setResources({
          [i18nLocale ?? locale]: {
            'libs-journeys-ui': uiResources.default || uiResources
          }
        })
      } catch (error) {
        console.error(
          `Error loading locale resources for ${locale} (${directoryLocale}):`,
          error
        )
      }
    },
    [locale]
  )

  useEffect(() => {
    const directoryLocale = LOCALE_MAP[locale] || locale
    void loadResources(directoryLocale)
  }, [locale, loadResources])

  // Create a new i18next instance for this component tree
  const i18nInstance = useMemo(() => {
    const namespaces = ['libs-journeys-ui']
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
