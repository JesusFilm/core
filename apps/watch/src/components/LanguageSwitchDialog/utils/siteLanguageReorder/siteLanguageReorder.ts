import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { LANGUAGE_MAPPINGS } from '../../../../libs/localeMapping'

// Extended interface to support headers and dividers
export interface ExtendedLanguageOption extends LanguageOption {
  type?: 'language' | 'header' | 'divider'
}

interface SiteLanguageReorderParams {
  languages: LanguageOption[]
  siteLang: LanguageOption | null
  browserLanguage: string | undefined
  country: string | undefined
}

/**
 * Reorders languages with headers and dividers:
 * 1. "Suggested" header
 * 2. Site language (current locale), browser language, country-based language
 * 3. Divider
 * 4. All other languages
 *
 * @param params - Object containing languages array and preference data
 * @returns Reordered array of ExtendedLanguageOption objects
 */
export function siteLanguageReorder({
  languages,
  siteLang,
  browserLanguage,
  country
}: SiteLanguageReorderParams): ExtendedLanguageOption[] {
  const suggestedLanguages: LanguageOption[] = []
  const remainingLanguages: LanguageOption[] = []
  const suggestedIds = new Set<string>()

  // Extract browserLanguage (e.g., 'en-US' -> 'en')
  const browserLangCode = browserLanguage?.split('-')[0]

  // Find language based on country using existing LANGUAGE_MAPPINGS
  const countryLangCode = country
    ? Object.keys(LANGUAGE_MAPPINGS).find((locale) =>
        LANGUAGE_MAPPINGS[locale]?.geoLocations?.includes(country)
      )
    : null

  // Add site language first if it exists
  if (siteLang) {
    suggestedLanguages.push(siteLang)
    suggestedIds.add(siteLang.id)
  }

  // Add browser language if different from site language
  if (browserLangCode) {
    const browserLang = languages.find((lang) => lang.id === browserLangCode)
    if (browserLang && !suggestedIds.has(browserLang.id)) {
      suggestedLanguages.push(browserLang)
      suggestedIds.add(browserLang.id)
    }
  }

  // Add country language if different from site and browser languages
  if (countryLangCode) {
    const countryLang = languages.find((lang) => lang.id === countryLangCode)
    if (countryLang && !suggestedIds.has(countryLang.id)) {
      suggestedLanguages.push(countryLang)
      suggestedIds.add(countryLang.id)
    }
  }

  // Add remaining languages
  for (const lang of languages) {
    if (!suggestedIds.has(lang.id)) {
      remainingLanguages.push(lang)
    }
  }

  // Build final array with headers and dividers
  const result: ExtendedLanguageOption[] = []

  // Only show suggested section if there are suggested languages
  if (suggestedLanguages.length > 0) {
    // Add "Suggested" header
    result.push({
      id: '__header_suggested__',
      type: 'header'
    })

    // Add suggested languages
    result.push(
      ...suggestedLanguages.map((lang) => ({
        ...lang,
        type: 'language' as const
      }))
    )

    // Add divider if there are remaining languages
    if (remainingLanguages.length > 0) {
      result.push({
        id: '__divider__',
        type: 'divider'
      })
    }
  }

  // Add remaining languages
  result.push(
    ...remainingLanguages.map((lang) => ({
      ...lang,
      type: 'language' as const
    }))
  )

  return result
}
