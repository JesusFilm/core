import { GetLanguages } from '@core/journeys/ui/useLanguagesQuery/__generated__/GetLanguages'

export interface LanguageMapping {
  id: string
  internalName: string
}

/**
 * Builds a hash map where the key is the language's non-primary (local) name
 * and the value is an object containing the internal language id and the internal language name.
 */
export function buildLanguageHashMap(
  languages: GetLanguages['languages']
): Record<string, LanguageMapping> {
  return languages.reduce(
    (mapping, language) => {
      // Use the non-primary name for mapping
      const localName = language.name.find((n) => !n.primary)?.value
      if (localName) {
        mapping[localName] = { id: language.id, internalName: localName }
      }
      return mapping
    },
    {} as Record<string, LanguageMapping>
  )
}
