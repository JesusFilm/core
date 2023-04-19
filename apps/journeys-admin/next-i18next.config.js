const path = require('path')

console.log('NEXT_PUBLIC_VERCEL_ENV', process.env.NEXT_PUBLIC_VERCEL_ENV)
console.log('CI', process.env.CI)
console.log(
  'localePath test',
  process.env.NEXT_PUBLIC_VERCEL_ENV == null || process.env.CI != null
)

/**
 * @type {import('next-i18next').UserConfig}
 **/
const i18nConfig = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
    localePath: path.resolve(
      process.env.NEXT_PUBLIC_VERCEL_ENV == null || process.env.CI != null
        ? './libs/locales'
        : './public/locales'
    )
  }
}

module.exports = i18nConfig
