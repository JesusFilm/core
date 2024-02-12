const isBrowser = typeof window !== 'undefined'
let localePath
if (isBrowser) {
  // browser
  localePath = '../../libs/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = require('path').resolve('../../libs/locales')
} else {
  // vercel run time
  localePath = require('path').resolve('../../libs/locales')
}

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      'am', // Amharic
      'ar', // Arabic
      'bn', // Bengali
      'en', // English
      'es', // Spanish
      'fr', // French
      'hi', // Hindi
      'id', // Indonesian
      'ja', // Japanese
      'my', // Burmese
      'ru', // Russian
      'th', // Thai
      'tl', // Tagalog
      'tr', // Turkish
      'ur', // Urdu (Pakistan)
      'vi', // Vietnamese
      'zh-CN', // Chinese, Simplified
      'zh-TW' // Chinese, Traditional
    ],
    localeDetection: false
  },
  fallbackLng: {
    default: ['en'],
    am: ['am-ET'],
    ar: ['ar-SA'],
    bn: ['bn-BD'],
    es: ['es-ES'],
    fr: ['fr-FR'],
    hi: ['hi-IN'],
    id: ['id-ID'],
    ja: ['ja-JP'],
    my: ['my-MM'],
    ru: ['ru-RU'],
    th: ['th-TH'],
    tl: ['tl-PH'],
    tr: ['tr-TR'],
    ur: ['ur-PK'],
    vi: ['vi-VN'],
    zh: ['zh-CN'],
    'zh-CN': ['zh-CN'],
    'zh-TW': ['zh-TW']
  },
  localePath
}

module.exports = i18nConfig
