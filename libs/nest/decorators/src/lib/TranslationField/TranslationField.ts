import { Translation } from '@core/nest/common/TranslationModule'

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
      parent: { [key: string]: Translation[] },
      languageId?: string,
      primary?: boolean
    ) {
      const translations = parent[name]
      return filterTranslations(translations, languageId, primary)
    }
  }
}

function filterTranslations(
  translations: Translation[],
  languageId?: string,
  primary?: boolean
): Translation[] {
  if (translations == null || (languageId == null && primary == null))
    return translations

  return translations
    .filter(
      ({ languageId: _languageId, primary: _primary }) =>
        _languageId === languageId || _primary === primary
    )
    .sort((a, b) => (a.primary ? 1 : -1))
}
