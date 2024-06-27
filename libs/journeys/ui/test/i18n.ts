import i18next, { use } from 'i18next'
import { initReactI18next } from 'react-i18next'

import appJourneysUiTranslations from '../../../locales/en/libs-journeys-ui.json'

void use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: {
      'libs-journeys-ui': appJourneysUiTranslations
    }
  }
})

export default i18next
