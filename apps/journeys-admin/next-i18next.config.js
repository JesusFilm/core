const path = require('path')

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localePath: path.resolve('./libs/locales')
  }
}

module.exports = i18nConfig
