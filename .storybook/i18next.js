const { initReactI18next } = require('react-i18next')
const i18n = require('i18next')
const LanguageDetector = require('i18next-browser-languagedetector')

const ns = ['common', 'apps-journeys', 'libs-journeys-ui']
const supportedLngs = ['en', 'af', 'mi']

i18n
  .use(
    LanguageDetector.type == null ? LanguageDetector.default : LanguageDetector
  )
  .use(initReactI18next)
  .init({
    react: {
      wait: true,
      useSuspense: false
    },
    nsSeparator: false,
    keySeparator: false,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    defaultNS: 'common',
    ns,
    supportedLngs
  })

supportedLngs.forEach((lang) => {
  ns.forEach((n) => {
    i18n.addResourceBundle(
      lang,
      n,
      require(`../libs/locales/${lang}/${n}.json`)
    )
  })
})

module.exports = i18n
