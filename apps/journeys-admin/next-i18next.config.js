const { supportedLocales } = require('./middleware')

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
    locales: supportedLocales,
    localeDetection: false
  },
  fallbackLng: {
    default: ['en'],
    am: ['am-ET'],
    ar: ['ar-SA'],
    bn: ['bn-BD'],
    es: ['es-ES'],
    'es-AR': ['es-ES'],
    'es-CO': ['es-ES'],
    'es-MX': ['es-ES'],
    'es-PE': ['es-ES'],
    'es-US': ['es-ES'],
    'es-VE': ['es-ES'],
    'es-419': ['es-ES'],
    fr: ['fr-FR'],
    'fr-BE': ['fr-FR'],
    'fr-CA': ['fr-FR'],
    'fr-LU': ['fr-FR'],
    'fr-QC': ['fr-FR'],
    'fr-CH': ['fr-FR'],
    hi: ['hi-IN'],
    id: ['id-ID'],
    ja: ['ja-JP'],
    my: ['my-MM'],
    ru: ['ru-RU'],
    'ru-BY': ['ru-RU'],
    'ru-MD': ['ru-RU'],
    'ru-UA': ['ru-RU'],
    th: ['th-TH'],
    tl: ['tl-PH'],
    tr: ['tr-TR'],
    'tr-CY': ['tr-TR'],
    ur: ['ur-PK'],
    vi: ['vi-VN'],
    'zh-CN': ['zh-CN'],
    'zh-SG': ['zh-CN'],
    'zh-TW': ['zh-TW'],
    'zh-HK': ['zh-TW'],
    'zh-MO': ['zh-TW']
  },
  localePath
}

module.exports = i18nConfig
