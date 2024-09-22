import mapValues from 'lodash/mapValues'

import { Continent, Language } from '../../algolia/SearchBarProvider'
import { GetLanguagesContinents_languages as Languages } from '../__generated__/GetLanguagesContinents'

export interface LanguageContinentsRecord {
  [continent: Continent]: Language[]
}

interface sortLanguageContinentsProps {
  languages: Languages[]
}

export function sortLanguageContinents({
  languages
}: sortLanguageContinentsProps): LanguageContinentsRecord {
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
