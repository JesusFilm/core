import { LANGUAGE_MAPPINGS } from './localeMapping'

describe('LANGUAGE_MAPPINGS', () => {
  describe('languageSlugs uniqueness', () => {
    it('should have unique language slugs across all locales', () => {
      // Collect all language slugs
      const allLanguageSlugs = Object.values(LANGUAGE_MAPPINGS).flatMap(
        (mapping) => mapping.languageSlugs
      )

      // Create a map to track occurrences
      const slugOccurrences = new Map<string, string[]>()
      Object.entries(LANGUAGE_MAPPINGS).forEach(([locale, mapping]) => {
        mapping.languageSlugs.forEach((slug) => {
          if (!slugOccurrences.has(slug)) {
            slugOccurrences.set(slug, [])
          }
          slugOccurrences.get(slug)?.push(locale)
        })
      })

      // Find duplicates
      const duplicates = Array.from(slugOccurrences.entries())
        .filter(([_, locales]) => locales.length > 1)
        .map(([slug, locales]) => ({
          slug,
          locales
        }))

      // Assert no duplicates exist
      if (duplicates.length > 0) {
        const errorMessage = duplicates
          .map(
            ({ slug, locales }) =>
              `  "${slug}" is used in locales: ${locales.join(', ')}`
          )
          .join('\n')
        throw new Error(`Found duplicate language slugs:\n${errorMessage}`)
      }

      // Additional check for array length to ensure no slugs were lost
      const uniqueSlugs = new Set(allLanguageSlugs)
      expect(allLanguageSlugs.length === uniqueSlugs.size).toBeTruthy()
    })
  })

  describe('geoLocations uniqueness', () => {
    it('should have unique country codes across all locales', () => {
      // Collect all country codes
      const allCountryCodes = Object.values(LANGUAGE_MAPPINGS).flatMap(
        (mapping) => mapping.geoLocations
      )

      // Create a map to track occurrences
      const countryOccurrences = new Map<string, string[]>()
      Object.entries(LANGUAGE_MAPPINGS).forEach(([locale, mapping]) => {
        mapping.geoLocations.forEach((countryCode) => {
          if (!countryOccurrences.has(countryCode)) {
            countryOccurrences.set(countryCode, [])
          }
          countryOccurrences.get(countryCode)?.push(locale)
        })
      })

      // Find duplicates
      const duplicates = Array.from(countryOccurrences.entries())
        .filter(([_, locales]) => locales.length > 1)
        .map(([countryCode, locales]) => ({
          countryCode,
          locales
        }))

      // Assert no duplicates exist
      if (duplicates.length > 0) {
        const errorMessage = duplicates
          .map(
            ({ countryCode, locales }) =>
              `  "${countryCode}" is used in locales: ${locales.join(', ')}`
          )
          .join('\n')
        throw new Error(`Found duplicate country codes:\n${errorMessage}`)
      }

      // Additional check for array length to ensure no codes were lost
      const uniqueCodes = new Set(allCountryCodes)
      expect(allCountryCodes.length === uniqueCodes.size).toBeTruthy()
    })
  })
})
