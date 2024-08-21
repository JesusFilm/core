import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetLanguagesContinents } from './__generated__/GetLanguagesContinents'

export const GET_LANGUAGES_CONTINENTS = gql`
  query GetLanguagesContinents {
    languages {
      id
      name(languageId: "529") {
        value
      }
      countryLanguages {
        country {
          continent {
            id
          }
        }
      }
    }
  }
`

export function useLanguagesContinentsQuery(): QueryResult<GetLanguagesContinents> {
  return useQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}