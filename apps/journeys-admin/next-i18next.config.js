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

// Next.js URL locales are short codes (`fr`, `es`) but Crowdin writes the
// translation folders in libs/locales with full region tags (`fr-FR`,
// `es-ES`). Map each short URL locale to its folder. `default` is i18next's
// catch-all, not a language tag.
/** @type {Record<string, string[]>} */
const fallbackLng = {
  default: ['en'],
  es: ['es-ES'],
  fr: ['fr-FR'],
  id: ['id-ID'],
  th: ['th-TH'],
  ja: ['ja-JP'],
  ko: ['ko-KR'],
  ru: ['ru-RU'],
  tr: ['tr-TR'],
  zh: ['zh-Hans-CN'],
  de: ['de-DE'],
  ne: ['ne-NP'],
  ms: ['ms-MY'],
  pt: ['pt-BR']
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
