import { CampaignStringKey } from '@core/prisma/journeys/client'

import {
  CAMPAIGN_STRING_DEFAULTS,
  CAMPAIGN_STRING_KEYS
} from './campaignStrings'

type CampaignBundle = Record<string, string>

/**
 * Maps a language's bcp47 tag to its libs/locales folder, mirroring the
 * admin's `fallbackLng` in apps/journeys-admin/next-i18next.config.js. Keep
 * the two in sync.
 */
const CAMPAIGN_LOCALE_FOLDERS: Record<string, string> = {
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

// One chunk per folder so the API bundle only loads the bundle a campaign
// actually needs. The libs-journeys-ui bundle is keyed by its English strings.
async function loadCampaignBundle(folder: string): Promise<CampaignBundle> {
  const bundle = await import(
    /* webpackChunkName: "campaign-locale-[request]" */
    `../../../../../../libs/locales/${folder}/libs-journeys-ui.json`
  )
  return bundle.default
}

/** The libs/locales folder for a bcp47 tag; null for English or an unknown tag. */
export function campaignLocaleFolder(
  bcp47: string | null | undefined
): string | null {
  if (bcp47 == null) return null
  const exact = CAMPAIGN_LOCALE_FOLDERS[bcp47]
  if (exact != null) return exact
  const primary = bcp47.split('-')[0]
  return CAMPAIGN_LOCALE_FOLDERS[primary] ?? null
}

/**
 * The seventeen Campaign String values for a campaign whose default language
 * has the given bcp47 tag: the English wording, or the libs-journeys-ui
 * bundle's translation when the language is not English and the bundle has
 * that exact string (PRD §2, Languages rule). The English wording reaches the
 * bundles through getCampaignStringDefaults in libs/journeys/ui.
 */
export async function resolveCampaignStringValues(
  bcp47: string | null | undefined
): Promise<Record<CampaignStringKey, string>> {
  const folder = campaignLocaleFolder(bcp47)
  if (folder == null) return { ...CAMPAIGN_STRING_DEFAULTS }
  const bundle = await loadCampaignBundle(folder)
  const values = { ...CAMPAIGN_STRING_DEFAULTS }
  for (const key of CAMPAIGN_STRING_KEYS) {
    const translated = bundle[CAMPAIGN_STRING_DEFAULTS[key]]
    if (typeof translated === 'string' && translated.trim() !== '')
      values[key] = translated
  }
  return values
}
