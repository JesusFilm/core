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
      'af', // Afrikaans
      'ar', // Arabic
      'de', // German
      'en', // English
      'es', // Spanish
      'fa', // Persian
      'fr', // French
      'he', // Hebrew
      'hi', // Hindi
      'id', // Indonesian
      'ja', // Japanese
      'ko', // Korean
      'mi', // Māori
      'pt', // Portuguese
      'ru', // Russian
      'tr', // Turkish
      'ur', // Urdu
      'vi', // Vietnamese
      'zh' // Chinese
    ]
    // localeDetection: false
  },
  fallbackLng: {
    default: ['en']
  },
  localePath
}

module.exports = i18nConfig
