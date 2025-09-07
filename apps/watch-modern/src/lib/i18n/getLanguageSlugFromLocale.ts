import { LANGUAGE_MAPPINGS } from './localeMapping'

/**
 * Gets the primary language slug for a given UI language code.
 * Used for constructing video URLs and routing.
 * @param locale - The UI language code
 * @returns The primary language slug or 'english.html' if not found
 * @example
 * ```ts
 * const languageSlug = getLanguageSlugFromLocale('en') // returns 'english.html'
 * const languageSlug = getLanguageSlugFromLocale('es') // returns 'spanish-latin-american.html'
 * ```
 */
export const getLanguageSlugFromLocale = (
  locale: string | undefined | null
): string => {
  if (locale && LANGUAGE_MAPPINGS[locale]?.languageSlugs[0]) {
    return LANGUAGE_MAPPINGS[locale].languageSlugs[0]
  }
  return LANGUAGE_MAPPINGS['en'].languageSlugs[0]
}
