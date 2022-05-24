const path = require('path')

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultNS: 'apps-journeys',
    defaultLocale: 'en',
    locales: ['en'],
    localePath: path.resolve('./locales')
  }
}

module.exports = i18nConfig
