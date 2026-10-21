import { parseTranslations } from './translatedValue'

/**
 * The public read of a Translated Field: the requested language's translation
 * when one is stored and non-empty, else the default-language column, else
 * empty. Two steps, server-side, so the viewer never receives a missing
 * marker. The default language's value is the column itself, so asking for
 * the default returns the column and ignores any entry stored under it.
 */
export function resolveText(
  field: string | null | undefined,
  translations: unknown,
  languageId: string | null | undefined,
  defaultLanguageId: string
): string {
  if (languageId != null && languageId !== defaultLanguageId) {
    const entry = parseTranslations(translations)[languageId]
    if (entry != null && typeof entry.value === 'string' && entry.value !== '')
      return entry.value
  }
  return field ?? ''
}
