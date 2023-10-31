import {
  Language,
  LanguageOption
} from '@core/shared/ui/MultipleLanguageAutocomplete'

export function getLanguages(
  languageIds: string[],
  languages?: Language[]
): string {
  const languageNames = languageIds?.map((languageId) =>
    getLanguage(languageId, languages)
  )
  return languageNames
    ?.map(
      (languageName) => languageName.localName ?? languageName.nativeName ?? ' '
    )
    .join(', ')
}

export function getLanguage(
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
