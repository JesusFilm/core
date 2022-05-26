const path = require('path')

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    locales: [
      'ar',
      'de',
      'en',
      'es',
      'fa',
      'fr',
      'he',
      'hi',
      'id',
      'ja',
      'ko',
      'pt',
      'ru',
      'tr',
      'ur',
      'vi',
      'zh-Hans',
      'zh-Hant'
    ],
    defaultLocale: 'en',
    localeDetection: false,
    localePath: path.resolve('./libs/locales')
  }
}

module.exports = i18nConfig
