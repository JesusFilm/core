import mapValues from 'lodash/mapValues'

import { GetLanguagesContinentsQuery } from '../useLanguagesContinentsQuery/__generated__/useLanguagesContinentsQuery'

interface LanguageContinentsRecord {
  [continent: string]: string[]
}

type Languages = GetLanguagesContinentsQuery['languages'][number]

interface useSortLanguageContinentsProps {
  languages: Languages[]
}

export function useSortLanguageContinents({
  languages
}: useSortLanguageContinentsProps): LanguageContinentsRecord {
  const record: Record<string, Set<string>> = languages.reduce(
    (acc: Record<string, Set<string>>, language: Languages) => {
      language.countryLanguages.forEach((countryLanguage) => {
        const continentId = countryLanguage.country.continent.id

        if (acc[continentId] == null) {
          acc[continentId] = new Set()
        }

        acc[continentId].add(language.name[0].value)
      })
      return acc
    },
    {}
  )

  return mapValues(record, (value) => Array.from(value))
}
