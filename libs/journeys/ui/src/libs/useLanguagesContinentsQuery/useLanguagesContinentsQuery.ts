import {
  LazyQueryResultTuple,
  OperationVariables,
  QueryResult,
  gql,
  useLazyQuery,
  useQuery
} from '@apollo/client'

import { GetLanguagesContinentsQuery } from './__generated__/useLanguagesContinentsQuery'

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

export function useLanguagesContinentsQuery(): QueryResult<GetLanguagesContinentsQuery> {
  return useQuery<GetLanguagesContinentsQuery>(GET_LANGUAGES_CONTINENTS)
}

export function useLanguagesContinentsLazyQuery(): LazyQueryResultTuple<
  GetLanguagesContinentsQuery,
  OperationVariables
> {
  return useLazyQuery<GetLanguagesContinentsQuery>(GET_LANGUAGES_CONTINENTS)
}
