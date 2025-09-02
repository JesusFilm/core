import i18next, { use } from 'i18next'
// eslint-disable-next-line no-restricted-imports
import { initReactI18next } from 'react-i18next'

// eslint-disable-next-line @nx/enforce-module-boundaries
import appJourneysUiTranslations from '../../../locales/en/libs-journeys-ui.json'

// eslint-disable-next-line react-hooks/rules-of-hooks
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
