import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetLanguagesContinents } from './__generated__/GetLanguagesContinents'

export const GET_LANGUAGES_CONTINENTS = gql`
  query GetLanguagesContinents {
    languages {
      id
      name {
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
  const query = useQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)

  return query
}
