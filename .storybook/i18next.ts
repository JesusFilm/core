import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

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

export default i18n
