import mapValues from 'lodash/mapValues'

import { useLanguagesContinentsQuery } from '@core/journeys/ui/useLanguagesContinentsQuery'

interface LanguageContinentsRecord {
  [continent: string]: string[]
}

export function useSortLanguageContinents(): LanguageContinentsRecord {
  const { data } = useLanguagesContinentsQuery()
  if (data?.languages == null) return {}

  const record: Record<string, Set<string>> = data?.languages.reduce(
    (acc, language) => {
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
