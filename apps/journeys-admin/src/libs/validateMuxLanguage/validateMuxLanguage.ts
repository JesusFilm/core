/**
 * Validates if a language code is supported by Mux for auto-generated subtitles.
 * Matches backend validation in apis/api-media/src/schema/mux/video/service.ts
 *
 * Supported languages: en, es, it, pt, de, fr, pl, ru, nl, ca, tr, sv, uk, no, fi, sk, el, cs, hr, da, ro, bg
 *
 * @param languageCode - BCP47 language code (e.g., 'en', 'es', 'fr')
 * @returns true if language is supported by Mux, false otherwise
 */
export function validateMuxLanguage(
  languageCode: string | null | undefined
): boolean {
  if (languageCode == null) return false

  // Mux-supported language codes for auto-generated subtitles
  const VALID_MUX_LANGUAGE_CODES = [
    'en', // English
    'es', // Spanish
    'it', // Italian
    'pt', // Portuguese
    'de', // German
    'fr', // French
    'pl', // Polish
    'ru', // Russian
    'nl', // Dutch
    'ca', // Catalan
    'tr', // Turkish
    'sv', // Swedish
    'uk', // Ukrainian
    'no', // Norwegian
    'fi', // Finnish
    'sk', // Slovak
    'el', // Greek
    'cs', // Czech
    'hr', // Croatian
    'da', // Danish
    'ro', // Romanian
    'bg' // Bulgarian
  ]

  return VALID_MUX_LANGUAGE_CODES.includes(languageCode.toLowerCase())
}
