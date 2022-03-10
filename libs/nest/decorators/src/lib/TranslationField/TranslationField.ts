export interface Translation {
  languageId: string
  primary: boolean
  value: string
}

export function TranslationField(name: string) {
  return (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) => {
    descriptor.value = function (
      parent: { [key: string]: Translation[][] | Translation[] },
      languageId?: string,
      primary?: boolean
    ) {
      const translations = parent[name]
      if (Array.isArray(translations[0])) {
        return (translations as Translation[][]).map((translations) =>
          filterTranslations(translations, languageId, primary)
        )
      } else {
        return filterTranslations(
          translations as Translation[],
          languageId,
          primary
        )
      }
    }
  }
}

function filterTranslations(
  translations: Translation[],
  languageId?: string,
  primary?: boolean
) {
  if (translations == null || (languageId == null && primary == null))
    return translations

  return translations.filter(
    ({ languageId: _languageId, primary: _primary }) =>
      _languageId === languageId || _primary === primary
  )
}
