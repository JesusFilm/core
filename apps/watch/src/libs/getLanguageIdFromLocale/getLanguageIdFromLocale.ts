/**
 * Type for supported UI language codes based on the i18n config
 */
const UI_LANGUAGE_CODES = [
  'en',
  'es',
  'fr',
  'id',
  'th',
  'ja',
  'ko',
  'ru',
  'tr',
  'zh',
  'zh-Hans-CN'
]

/**
 * Mapping of UI language codes to their corresponding language IDs
 */
export const UI_LANGUAGE_IDS: Readonly<Record<string, string>> = {
  en: '529', // English
  es: '21028', // Spanish (Latin American)
  fr: '496', // French
  id: '16639', // Indonesian (Standard)
  th: '13169', // Thai
  ja: '7083', // Japanese
  ko: '3804', // Korean
  ru: '3934', // Russian
  tr: '1942', // Turkish
  zh: '20615', // Mandarin China
  'zh-Hans-CN': '21754' // Chinese Simplified
} as const

/**
 * Gets the language ID for a given UI language code.
 * @param locale - The UI language code
 * @returns The corresponding language ID or undefined if not found
 * @example
 * ```ts
 * const languageId = getLanguageIdFromLocale('en') // returns '529'
 * ```
 */
export const getLanguageIdFromLocale = (
  locale: string | undefined | null
): string => {
  if (locale != null && UI_LANGUAGE_CODES.includes(locale)) {
    return UI_LANGUAGE_IDS[locale]
  } else {
    return UI_LANGUAGE_IDS['en']
  }
}
