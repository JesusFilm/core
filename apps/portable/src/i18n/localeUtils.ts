import * as Localization from 'expo-localization'

/**
 * Get all available locales on the device
 */
function getAvailableLocales(): string[] {
  const locales = Localization.getLocales()
  return locales
    .map((locale) => locale.languageCode)
    .filter((locale): locale is string => locale !== null)
}

const SUPPORTED_LOCALES = ['en', 'es', 'fr']

/**
 * Check if a locale is supported by the app
 */
function isLocaleSupported(locale: string): boolean {
  return SUPPORTED_LOCALES.includes(locale)
}

/**
 * Get the best matching locale for the device
 */
export function getBestMatchingLocale(): string {
  const availableLocales = getAvailableLocales()

  for (const locale of availableLocales) {
    if (isLocaleSupported(locale)) {
      return locale
    }
  }

  return 'en'
}
