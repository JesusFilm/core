import 'intl-pluralrules'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from './resources'
import { getBestMatchingLocale } from './localeUtils'

// Get the best matching locale for the device
const deviceLocale = getBestMatchingLocale()

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: 'en',
  debug: __DEV__,
  lng: deviceLocale,

  interpolation: {
    escapeValue: false
  },
  react: {
    useSuspense: false
  },
  supportedLngs: ['en', 'es', 'fr'],
  load: 'languageOnly',
  cleanCode: true
})

export default i18n
