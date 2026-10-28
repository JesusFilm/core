import { extractLanguageNames } from '@core/shared/ui/extractLanguageNames'
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
        ...extractLanguageNames(language?.name ?? [])
      }))
    : []
}
