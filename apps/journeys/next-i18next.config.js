let localePath
if (typeof window !== 'undefined') {
  // browser
  localePath = './public/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = require('path').resolve('../../libs/locales')
} else {
  // vercel run time
  localePath = require('path').resolve('./public/locales')
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
      'zh-Hans-CN' // Chinese, Simplified
    ],
    localeDetection: false
  },
  // One entry per translation folder in libs/locales, mapping the language
  // (or language-script) code to the folder that holds its files. URL locales
  // only ever activate a few of these, but legal/about-chat resolves journey
  // languages (?lang=<bcp47>) through this same map (NES-1724/NES-1731) —
  // when adding a locale folder, add its language here too.
  fallbackLng: {
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
  },
  localePath
}

module.exports = i18nConfig
