import i18next, { use } from 'i18next'
import { initReactI18next } from 'react-i18next'

import appJourneysAdminTranslations from '../../../libs/locales/en/apps-journeys-admin.json'

void use(initReactI18next).init({
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false
  },
  resources: {
    en: {
      'apps-journeys-admin': appJourneysAdminTranslations
    }
  }
})

export default i18next
