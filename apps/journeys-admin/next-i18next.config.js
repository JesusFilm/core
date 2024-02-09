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

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: [
      // Amharic
      'am',
      'am-ET',

      // Arabic
      'ar',
      'ar-BH', // Bahrain
      'ar-EG', // Egypt
      'ar-SA', // Saudi Arabia
      'ar-YE', // Yemen

      // Bengali
      'bn',
      'bn-BD', // Bangla
      'bn-IN', // Indian

      // English
      'en',
      'en-AU', // Australia
      'en-CA', // Canada
      'en-GB', // United Kingdom
      'en-NZ', // New Zealand
      'en-US', // United States

      // Spanish
      'es',
      'es-ES',
      'es-AR', // Argentina
      'es-CO', // Columbia
      'es-MX', // Mexico
      'es-PE', // Peru
      'es-US', // USA
      'es-VE', // Venezuela
      'es-419', // Latin, America

      // French
      'fr',
      'fr-FR',
      'fr-BE', // Belgium
      'fr-CA', // Canada
      'fr-LU', // Luxembourg
      'fr-QC', // Quebec
      'fr-CH', // Switzerland

      // Hindi
      'hi',
      'hi-IN',

      // Indonesia
      'id',
      'id-ID',

      // Japanese
      'ja',
      'ja-JP',

      // Burmese
      'my',
      'my-MM',

      // Russian
      'ru',
      'ru-RU',
      'ru-BY', // Belarus
      'ru-MD', // Moldova
      'ry-UA', // Rusyn
      'ru-UA', // Ukraine

      // Thai
      'th',
      'th-TH',

      // Tagalog
      'tl',
      'tl-PH',

      // Turkish
      'tr',
      'tr-TR',
      'tr-CY', // Cyprus

      // Urdu (Pakistan)
      'ur-PK',

      // Vietnamese
      'vi',
      'vi-VN',

      // Chinese, Simplified
      'zh-CN',
      'zh-SG', // Singapore

      // Chinese, Traditional
      'zh-TW',
      'zh-HK', // Hongkong
      'zh-MO' // Macao
    ],
    localeDetection: false
  },
  fallbackLng: {
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
    vi: ['vi-VN'],
    'ar-*': ['ar-SA'],
    'bn-*': ['bn-BD'],
    'en-*': ['en'],
    'es-*': ['es-ES'],
    'fr-*': ['fr-FR'],
    'ru-*': ['ru-RU'],
    'ry-UA': ['ru-RU'],
    'tr-*': ['tr-TR'],
    'zh-SG': ['zh-CN'],
    'zh-HK': ['zh-TW'],
    'zh-MO': ['zh-TW']
  },
  localePath
}

module.exports = i18nConfig
