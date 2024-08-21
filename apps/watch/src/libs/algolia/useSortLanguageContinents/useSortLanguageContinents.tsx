import mapValues from 'lodash/mapValues'

import { GetLanguagesContinents_languages as Languages } from '../../../../__generated__/GetLanguagesContinents'

interface LanguageContinentsRecord {
  [continent: string]: string[]
}

interface useSortLanguageContinentsProps {
  languages: Languages[]
}

export function useSortLanguageContinents({
  languages
}: useSortLanguageContinentsProps): LanguageContinentsRecord {
  const record: Record<string, Set<string>> = languages.reduce(
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
