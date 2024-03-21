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
      'en', // English
      'es', // Spanish
      'fr', // French
      'id', // Indonesian
      'ja', // Japanese
      'ru', // Russian
      'tr', // Turkish
      'zh', // Chinese
      'zh-Hans-CN' // Chinese, Simplified
    ],
    localeDetection: false
  },
  fallbackLng: {
    default: ['en'],
    es: ['es-ES'],
    fr: ['fr-FR'],
    id: ['id-ID'],
    ja: ['ja-JP'],
    ru: ['ru-RU'],
    tr: ['tr-TR'],
    zh: ['zh-Hans-CN']
  },
  localePath,
  react: { useSuspense: false }
}

module.exports = i18nConfig
