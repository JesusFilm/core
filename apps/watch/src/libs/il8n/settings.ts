import { InitOptions } from 'i18next'

export const fallbackLanguageId = 'en'
export const languages = [fallbackLanguageId]
export const defaultNS = 'translation'
export const cookieName = 'i18next'

export function getOptions(
  languageId = fallbackLanguageId,
  ns = defaultNS
): InitOptions {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng: fallbackLanguageId,
    lng: languageId,
    fallbackNS: defaultNS,
    defaultNS,
    ns
  }
}
