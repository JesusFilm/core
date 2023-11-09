import {
  Language,
  LanguageOption
} from '@core/shared/ui/MultipleLanguageAutocomplete'

export function convertLanguagesToOptions(
  languageIds: string[],
  languages?: Language[]
): LanguageOption[] {
  return languages != null
    ? languages
        ?.filter(({ id }) => languageIds.includes(id))
        .map((language) => ({
          id: language.id,
          localName: language?.name?.find(({ primary }) => !primary)?.value,
          nativeName: language?.name?.find(({ primary }) => primary)?.value
        }))
    : []
}
