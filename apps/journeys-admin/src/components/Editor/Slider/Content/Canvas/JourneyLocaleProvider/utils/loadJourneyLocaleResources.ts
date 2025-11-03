import { Dispatch, SetStateAction } from 'react'

export const LOCALE_MAP = {
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

export const loadJourneyLocaleResources = async (
  locale: string,
  setResources: Dispatch<SetStateAction<Record<string, Record<string, any>>>>,
  directoryLocale: string
): Promise<void> => {
  try {
    const [uiResources, adminResources] = await Promise.all([
      import(
        /* webpackChunkName: "locale-[request]" */
        `../../../../../../../../../../libs/locales/${directoryLocale}/libs-journeys-ui.json`
      ),
      import(
        /* webpackChunkName: "locale-[request]" */
        `../../../../../../../../../../libs/locales/${directoryLocale}/apps-journeys-admin.json`
      )
    ])

    // Map directoryLocale to i18n locale key
    // add more mappings here if database locale is not compatible with i18n locale key
    let i18nLocale: string | null = null
    if (directoryLocale === 'zh-Hans-CN') {
      i18nLocale = 'zh-Hans'
    }

    setResources({
      [i18nLocale ?? locale]: {
        'libs-journeys-ui': uiResources?.default || uiResources,
        'apps-journeys-admin': adminResources?.default || adminResources
      }
    })
  } catch (error) {
    // graceful error handling to stop app crash from webpack HMR in dev env
    // also handles missing locales
    console.error(
      `Error loading locale resources for ${locale} (${directoryLocale}):`,
      error
    )
  }
}
