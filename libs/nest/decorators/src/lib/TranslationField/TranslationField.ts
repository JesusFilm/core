export interface Translation {
  languageId: string
  primary: boolean
  value: string
  fallback?: boolean
}

export function TranslationField(
  name: string
): (
  _target: unknown,
  _propertyKey: string,
  descriptor: PropertyDescriptor
) => void {
  return (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    descriptor.value = function (
      parent: { [key: string]: Translation[][] | Translation[] },
      languageId?: string,
      primary?: boolean,
      fallback?: boolean
    ) {
      const translations = parent[name]
      if (Array.isArray(translations[0])) {
        return (translations as Translation[][]).map((translations) =>
          filterTranslations(translations, languageId, primary, fallback)
        )
      } else {
        return filterTranslations(
          translations as Translation[],
          languageId,
          primary,
          fallback
        )
      }
    }
  }
}

function filterTranslations(
  translations: Translation[],
  languageId?: string,
  primary?: boolean,
  fallback = false
): Translation[] {
  if (translations == null || (languageId == null && primary == null))
    return translations

  const results = translations.filter(
    ({ languageId: _languageId, primary: _primary }) =>
      _languageId === languageId || _primary === primary
  )
  if (results.length === 0 && fallback) {
    return translations.filter((t) => t.primary)
  }
  return results
}
