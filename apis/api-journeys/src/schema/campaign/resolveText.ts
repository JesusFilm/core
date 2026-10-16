import { TranslationsJson } from './translatedValue'

/**
 * The public read of a Translated Field: the requested language's translation
 * when one is stored and non-empty, else the default-language column, else
 * empty. Two steps, server-side, so the viewer never receives a missing
 * marker. The default language has no entry in `translations` (its value is
 * the column itself), so asking for the default simply returns the column.
 */
export function resolveText(
  field: string | null | undefined,
  translations: unknown,
  languageId: string | null | undefined
): string {
  if (
    languageId != null &&
    translations != null &&
    typeof translations === 'object' &&
    !Array.isArray(translations)
  ) {
    const entry = (translations as TranslationsJson)[languageId]
    if (entry != null && typeof entry.value === 'string' && entry.value !== '')
      return entry.value
  }
  return field ?? ''
}
