import {
  parseTranslations,
  readTranslatedField
} from '@core/journeys/ui/Campaign/libs/translatedField'

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
  const translating = languageId != null && languageId !== defaultLanguageId
  const entry =
    languageId != null ? parseTranslations(translations)[languageId] : null
  const { value, fallback } = readTranslatedField({ field, entry, translating })
  return value !== '' ? value : fallback
}
