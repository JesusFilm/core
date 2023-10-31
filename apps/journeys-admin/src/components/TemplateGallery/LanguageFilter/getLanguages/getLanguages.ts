import {
  Language,
  LanguageOption
} from '@core/shared/ui/MultipleLanguageAutocomplete'

export function getLanguages(
  languageIds: string[],
  languages?: Language[]
): LanguageOption[] {
  function getLanguage(
    languageId: string,
    languages?: Language[]
  ): LanguageOption {
    const language = languages?.find((language) => language?.id === languageId)

    const id = language?.id ?? ''
    const localName = language?.name?.find(({ primary }) => !primary)?.value
    const nativeName = language?.name?.find(({ primary }) => primary)?.value

    return {
      id,
      localName,
      nativeName
    }
  }

  const languageNames = languageIds?.map((languageId) =>
    getLanguage(languageId, languages)
  )
  return languageNames
}
