import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { resources } from './resources'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: __DEV__,

    interpolation: {
      escapeValue: false // React already escapes values
    },

    detection: {
      order: ['asyncStorage', 'navigator', 'htmlTag'],
      caches: ['asyncStorage']
    }
  })

export default i18n
