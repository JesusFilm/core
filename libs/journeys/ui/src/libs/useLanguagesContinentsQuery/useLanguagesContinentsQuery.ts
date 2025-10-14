import { OperationVariables, gql } from '@apollo/client'
import { useLazyQuery, useQuery } from '@apollo/client/react'

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

export function useLanguagesContinentsQuery(): useQuery.Result<GetLanguagesContinents> {
  return useQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}

export function useLanguagesContinentsLazyQuery(): useLazyQuery.ResultTuple<
  GetLanguagesContinents,
  OperationVariables
> {
  return useLazyQuery<GetLanguagesContinents>(GET_LANGUAGES_CONTINENTS)
}
