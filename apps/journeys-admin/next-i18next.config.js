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
      'am', // Amharic
      'ar', // Arabic
      'bn', // Bangla
      'en', // English
      'es', // Spanish
      'fil', // Tagalog
      'fr', // French
      'hi', // Hindi
      'id', // Indonesian
      'ja', // Japanese
      'my', // Burmese
      'ru', // Russian
      'th', // Thai
      'tr', // Turkish
      'ur', // Urdu
      'vi', // Vietnamese
      'zh' // Chinese
    ]
  },
  fallbackLng: {
    default: ['en']
  },
  localePath
}

module.exports = i18nConfig
