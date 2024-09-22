import {
  LazyQueryResultTuple,
  OperationVariables,
  QueryResult,
  gql,
  useLazyQuery,
  useQuery
} from '@apollo/client'

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

export function useLanguagesContinentsLazyQuery(): LazyQueryResultTuple<
  GetLanguagesContinents,
  OperationVariables
> {
  return useLazyQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}
