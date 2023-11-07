import { QueryResult, gql, useQuery } from '@apollo/client'
import { useState } from 'react'

import {
  GetLanguages,
  GetLanguagesVariables,
  GetLanguages_languages as Language
} from '../../../__generated__/GetLanguages'

export const GET_LANGUAGES = gql`
  query GetLanguages($languageId: ID) {
    languages(limit: 5000) {
      id
      name(languageId: $languageId, primary: true) {
        value
        primary
      }
    }
  }
`

export function useLanguagesQuery(
  variables?: GetLanguagesVariables
): QueryResult<GetLanguages, GetLanguagesVariables> & {
  filteredLanguages: Language[]
} {
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>([])
  const query = useQuery<GetLanguages, GetLanguagesVariables>(GET_LANGUAGES, {
    variables,
    onCompleted(data) {
      // 'selectedLanguages' lists the languages currently in use in our production templates.
      // To add a new language option, manually append it to this array.
      const selectedLanguages = [
        { name: 'English', id: '529' },
        { name: 'Italiano, Italian', id: '4415' },
        { name: 'Deutsch, German, Standard', id: '1106' },
        { name: 'polski, Polish', id: '4451' },
        { name: 'Français, French', id: '496' },
        { name: 'Shqip, Albanian', id: '20526' },
        { name: 'Português, Portuguese, Brazil', id: '584' },
        { name: 'Español, Spanish, Latin American', id: '21028' },
        { name: '普通話, Chinese, Mandarin', id: '20615' },
        { name: 'Русский, Russian', id: '3934' }
      ]

      const filtered = data.languages.filter((language) =>
        selectedLanguages.some(
          (selectedLanguage) => selectedLanguage.id === language.id
        )
      )
      setFilteredLanguages(filtered)
    }
  })

  return {
    ...query,
    filteredLanguages
  }
}
