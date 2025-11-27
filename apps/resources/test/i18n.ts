import i18next, { createInstance } from 'i18next'
// eslint-disable-next-line no-restricted-imports
import { initReactI18next } from 'react-i18next'

// eslint-disable-next-line @nx/enforce-module-boundaries
import appResourcesTranslations from '../../../libs/locales/en/apps-resources.json'

export const makeI18n = async (lng = 'en') => {
  const i18n = createInstance()
  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    resources: {
      en: {
        'apps-resources': appResourcesTranslations
      }
    }
  })

  return i18n
}

void makeI18n()

export default i18next
