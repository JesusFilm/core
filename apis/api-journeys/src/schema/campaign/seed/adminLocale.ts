import { CampaignStringKey } from '@core/prisma/journeys/client'

import { CAMPAIGN_STRING_DEFAULTS, CAMPAIGN_STRING_KEYS } from './campaignStrings'

type AdminBundle = Record<string, string>

/**
 * Maps a language's bcp47 tag to its libs/locales folder, mirroring the
 * admin's `fallbackLng` in apps/journeys-admin/next-i18next.config.js. Keep
 * the two in sync.
 */
const ADMIN_LOCALE_FOLDERS: Record<string, string> = {
  am: 'am-ET',
  ar: 'ar-SA',
  bn: 'bn-BD',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  hi: 'hi-IN',
  id: 'id-ID',
  ja: 'ja-JP',
  ko: 'ko-KR',
  mn: 'mn-MN',
  ms: 'ms-MY',
  my: 'my-MM',
  ne: 'ne-NP',
  pt: 'pt-BR',
  ru: 'ru-RU',
  th: 'th-TH',
  tl: 'tl-PH',
  tr: 'tr-TR',
  ur: 'ur-PK',
  vi: 'vi-VN',
  zh: 'zh-Hans-CN',
  'zh-Hant': 'zh-Hant-TW'
}

// One dynamic import per folder so the API bundle only loads the bundle a
// campaign actually needs. The admin bundle is keyed by its English strings.
const ADMIN_BUNDLE_LOADERS: Record<string, () => Promise<{ default: AdminBundle }>> = {
  'am-ET': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-am-ET" */
      '@core/locales/am-ET/apps-journeys-admin.json'
    ),
  'ar-SA': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ar-SA" */
      '@core/locales/ar-SA/apps-journeys-admin.json'
    ),
  'bn-BD': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-bn-BD" */
      '@core/locales/bn-BD/apps-journeys-admin.json'
    ),
  'de-DE': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-de-DE" */
      '@core/locales/de-DE/apps-journeys-admin.json'
    ),
  'es-ES': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-es-ES" */
      '@core/locales/es-ES/apps-journeys-admin.json'
    ),
  'fr-FR': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-fr-FR" */
      '@core/locales/fr-FR/apps-journeys-admin.json'
    ),
  'hi-IN': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-hi-IN" */
      '@core/locales/hi-IN/apps-journeys-admin.json'
    ),
  'id-ID': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-id-ID" */
      '@core/locales/id-ID/apps-journeys-admin.json'
    ),
  'ja-JP': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ja-JP" */
      '@core/locales/ja-JP/apps-journeys-admin.json'
    ),
  'ko-KR': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ko-KR" */
      '@core/locales/ko-KR/apps-journeys-admin.json'
    ),
  'mn-MN': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-mn-MN" */
      '@core/locales/mn-MN/apps-journeys-admin.json'
    ),
  'ms-MY': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ms-MY" */
      '@core/locales/ms-MY/apps-journeys-admin.json'
    ),
  'my-MM': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-my-MM" */
      '@core/locales/my-MM/apps-journeys-admin.json'
    ),
  'ne-NP': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ne-NP" */
      '@core/locales/ne-NP/apps-journeys-admin.json'
    ),
  'pt-BR': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-pt-BR" */
      '@core/locales/pt-BR/apps-journeys-admin.json'
    ),
  'ru-RU': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ru-RU" */
      '@core/locales/ru-RU/apps-journeys-admin.json'
    ),
  'th-TH': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-th-TH" */
      '@core/locales/th-TH/apps-journeys-admin.json'
    ),
  'tl-PH': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-tl-PH" */
      '@core/locales/tl-PH/apps-journeys-admin.json'
    ),
  'tr-TR': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-tr-TR" */
      '@core/locales/tr-TR/apps-journeys-admin.json'
    ),
  'ur-PK': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-ur-PK" */
      '@core/locales/ur-PK/apps-journeys-admin.json'
    ),
  'vi-VN': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-vi-VN" */
      '@core/locales/vi-VN/apps-journeys-admin.json'
    ),
  'zh-Hans-CN': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-zh-Hans-CN" */
      '@core/locales/zh-Hans-CN/apps-journeys-admin.json'
    ),
  'zh-Hant-TW': async () => await import(
      /* webpackChunkName: "campaign-admin-locale-zh-Hant-TW" */
      '@core/locales/zh-Hant-TW/apps-journeys-admin.json'
    )
}

/** The libs/locales folder for a bcp47 tag; null for English or an unknown tag. */
export function adminLocaleFolder(bcp47: string | null | undefined): string | null {
  if (bcp47 == null) return null
  const exact = ADMIN_LOCALE_FOLDERS[bcp47]
  if (exact != null) return exact
  const primary = bcp47.split('-')[0]
  return ADMIN_LOCALE_FOLDERS[primary] ?? null
}

/**
 * The seventeen Campaign String values for a campaign whose default language
 * has the given bcp47 tag: the English wording, or the admin i18next bundle's
 * translation when the language is not English and the bundle has that exact
 * string (PRD §2, Languages rule).
 */
export async function resolveCampaignStringValues(
  bcp47: string | null | undefined
): Promise<Record<CampaignStringKey, string>> {
  const folder = adminLocaleFolder(bcp47)
  const loader = folder == null ? null : ADMIN_BUNDLE_LOADERS[folder]
  if (loader == null) return { ...CAMPAIGN_STRING_DEFAULTS }
  const bundle = (await loader()).default
  const values = { ...CAMPAIGN_STRING_DEFAULTS }
  for (const key of CAMPAIGN_STRING_KEYS) {
    const translated = bundle[CAMPAIGN_STRING_DEFAULTS[key]]
    if (typeof translated === 'string' && translated.trim() !== '')
      values[key] = translated
  }
  return values
}
