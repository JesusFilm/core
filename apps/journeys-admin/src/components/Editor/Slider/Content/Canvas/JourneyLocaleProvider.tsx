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
import { I18nextProvider, useTranslation } from 'react-i18next'

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
  const { t } = useTranslation('libs-journeys-ui')
  const [resources, setResources] = useState<
    Record<string, Record<string, any>>
  >({})
  console.log('locale', locale)

  const loadResources = useCallback(
    async (directoryLocale: string): Promise<void> => {
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
        console.log('test translate Save', t('Submit'))
      } catch (error) {
        console.error(
          `Error loading locale resources for ${locale} (${directoryLocale}):`,
          error
        )
      }
    },
    [locale]
  )

  console.log('locale set on journey:', locale)

  // Dynamically load resources for the selected locale
  useEffect(() => {
    const directoryLocale = LOCALE_MAP[locale] || locale
    // setIsLoading(true)

    void loadResources(directoryLocale)
  }, [locale, loadResources])

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

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
