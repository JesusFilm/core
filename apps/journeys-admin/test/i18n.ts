import i18next, { use } from 'i18next'
// eslint-disable-next-line no-restricted-imports
import { initReactI18next } from 'react-i18next'

// eslint-disable-next-line @nx/enforce-module-boundaries
import appJourneysAdminTranslations from '../../../libs/locales/en/apps-journeys-admin.json'
// /workspaces/core/libs/locales/en/apps-journeys-admin.json

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
