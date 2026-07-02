const isBrowser = typeof window !== 'undefined'
let localePath
if (isBrowser) {
  // browser
  localePath = './public/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = require('path').resolve('../../libs/locales')
} else {
  // vercel run time
  localePath = require('path').resolve('./public/locales')
}

// Maps each language code to its libs/locales folder — one entry per folder.
// `default` is i18next's catch-all, not a language tag.
//
// Next.js URL locales are short codes (`fr`) but Crowdin writes the folders
// with full region tags (`fr-FR`). The editor canvas also resolves a journey's
// own language (any BCP-47 tag) to its folder through this same map
// (JourneyLocaleProvider / loadJourneyLocaleResources), so it must cover every
// journey language — not just the URL locales the admin UI exposes.
/** @type {Record<string, string[]>} */
const fallbackLng = {
  default: ['en'],
  am: ['am-ET'],
  ar: ['ar-SA'],
  bn: ['bn-BD'],
  de: ['de-DE'],
  es: ['es-ES'],
  fr: ['fr-FR'],
  hi: ['hi-IN'],
  id: ['id-ID'],
  ja: ['ja-JP'],
  ko: ['ko-KR'],
  ms: ['ms-MY'],
  my: ['my-MM'],
  ne: ['ne-NP'],
  pt: ['pt-BR'],
  ru: ['ru-RU'],
  th: ['th-TH'],
  tl: ['tl-PH'],
  tr: ['tr-TR'],
  ur: ['ur-PK'],
  vi: ['vi-VN'],
  zh: ['zh-Hans-CN'],
  'zh-Hant': ['zh-Hant-TW']
}

/** @type {import('next-i18next/pages').UserConfig} */
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'en', // English
      'es', // Spanish
      'fr', // French
      'id', // Indonesian
      'th', // Thai
      'ja', // Japanese
      'ko', // Korean
      'ru', // Russian
      'tr', // Turkish
      'zh', // Chinese
      'zh-Hans-CN', // Chinese, Simplified
      'de', // German
      'ne', // Nepali
      'ms', // Malay
      'pt' // Portuguese
    ],
    localeDetection: false
  },
  ns: ['apps-journeys-admin', 'libs-journeys-ui'],
  fallbackLng,
  // Resolve each short URL locale straight to its region folder at load time
  // so translations land directly under the `fr` key in the client store.
  // A static `localePath` relied on `fallbackLng` to reach `fr-FR`, but the
  // client skips `fr-FR` because it isn't in `supportedLngs` (the `locales`
  // list), so client-only-rendered strings silently fell back to English
  // (NES-1551). Tags already shaped like a folder (`zh-Hans-CN`) pass through.
  localePath: (lng, ns) =>
    `${localePath}/${fallbackLng[lng]?.[0] ?? lng}/${ns}.json`,
  serializeConfig: false,
  react: { useSuspense: false }
}

module.exports = i18nConfig
