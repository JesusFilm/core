import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { LANGUAGE_MAPPINGS } from '../../../../config/locales'

interface SiteLanguageReorderParams {
  languages: LanguageOption[]
  siteLang: LanguageOption | null
  browserLanguage: string | undefined
  country: string | undefined
}

/**
 * Reorders languages based on priority:
 * 1. Site language (current locale)
 * 2. Browser language preference
 * 3. Country-based language
 * 4. All other languages
 *
 * @param params - Object containing languages array and preference data
 * @returns Reordered array of LanguageOption objects
 */
export function siteLanguageReorder({
  languages,
  siteLang,
  browserLanguage,
  country
}: SiteLanguageReorderParams): LanguageOption[] {
  const reorderedLanguages = [...languages]
  const browserLanguages: LanguageOption[] = []
  const countryLanguages: LanguageOption[] = []
  const remainingLanguages: LanguageOption[] = []

  // Extract browserLanguage (e.g., 'en-US' -> 'en')
  const browserLangCode = browserLanguage?.split('-')[0]

  // Find language based on country using existing LANGUAGE_MAPPINGS
  const countryLangCode = country
    ? Object.keys(LANGUAGE_MAPPINGS).find((locale) =>
        LANGUAGE_MAPPINGS[locale].geoLocations.includes(country)
      )
    : null

  for (const lang of reorderedLanguages) {
    // Skip siteLang as it will be added first
    if (siteLang && lang.id === siteLang.id) {
      continue
    }

    // Check if it matches browser language
    if (browserLangCode && lang.id === browserLangCode) {
      browserLanguages.push(lang)
      continue
    }

    // Check if it matches country language
    if (
      countryLangCode &&
      lang.id === countryLangCode &&
      lang.id !== browserLangCode
    ) {
      countryLanguages.push(lang)
      continue
    }

    remainingLanguages.push(lang)
  }

  // Final order: siteLang, browserLanguage matches, country matches, then others
  return [
    ...(siteLang ? [siteLang] : []),
    ...browserLanguages,
    ...countryLanguages,
    ...remainingLanguages
  ]
}
