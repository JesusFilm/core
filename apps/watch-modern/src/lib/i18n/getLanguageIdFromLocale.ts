import { LANGUAGE_MAPPINGS } from './localeMapping'

/**
 * Gets the language ID for a given UI language code.
 * Mirrors legacy Watch logic for parity.
 * @param locale - The UI language code
 * @returns The corresponding language ID or '529' (English) if not found
 * @example
 * ```ts
 * const languageId = getLanguageIdFromLocale('en') // returns '529'
 * const languageId = getLanguageIdFromLocale('es') // returns '21028'
 * ```
 */
export const getLanguageIdFromLocale = (
  locale: string | undefined | null
): string => {
  if (locale && LANGUAGE_MAPPINGS[locale]?.languageId) {
    return LANGUAGE_MAPPINGS[locale].languageId
  }
  return LANGUAGE_MAPPINGS['en'].languageId
}
