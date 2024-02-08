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
      'am-ET', // Amharic
      'ar-SA', // Arabic
      'bn-BD', // Bangla
      'en', // English
      'es-ES', // Spanish
      'fr-FR', // French
      'hi-IN', // Hindi
      'id-ID', // Indonesian
      'ja-JP', // Japanese
      'my-MM', // Burmese
      'ru-RU', // Russian
      'th-TH', // Thai
      'tl-PH', // Tagalog
      'tr-TR', // Turkish
      'ur-PK', // Urdu (Pakistan)
      'vi-VN', // Vietnamese
      'zh-CN', // Chinese, Simplified
      'zh-TW' // Chinese, Traditional
    ],
    // add list of fallbacks
    localeDetection: false
  },
  localePath
}

module.exports = i18nConfig
