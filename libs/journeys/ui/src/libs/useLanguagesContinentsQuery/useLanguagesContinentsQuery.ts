import {
  LazyQueryResultTuple,
  OperationVariables,
  QueryResult,
  useLazyQuery,
  useQuery
} from '@apollo/client'
import { ResultOf, graphql } from '@core/shared/gql'

export type GetLanguagesContinents = ResultOf<typeof GET_LANGUAGES_CONTINENTS>

export const GET_LANGUAGES_CONTINENTS = graphql(`
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
`)

export function useLanguagesContinentsQuery(): QueryResult<GetLanguagesContinents> {
  return useQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}

export function useLanguagesContinentsLazyQuery(): LazyQueryResultTuple<
  GetLanguagesContinents,
  OperationVariables
> {
  return useLazyQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}
