import {
  Language,
  LanguageOption
} from '@core/shared/ui/MultipleLanguageAutocomplete'

export function convertLanguagesToOptions(
  languages?: Language[]
): LanguageOption[] {
  return languages != null
    ? languages.map((language) => ({
        id: language.id,
        localName: language?.name?.find(({ primary }) => !primary)?.value,
        nativeName: language?.name?.find(({ primary }) => primary)?.value
      }))
    : []
}
