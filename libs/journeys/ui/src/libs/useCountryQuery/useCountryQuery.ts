import { QueryResult, useQuery } from '@apollo/client'
import { ResultOf, VariablesOf, graphql } from '@core/shared/gql'

export type GetCountry = ResultOf<typeof GET_COUNTRY>
export type GetCountryVariables = VariablesOf<typeof GET_COUNTRY>

export const GET_COUNTRY = graphql(`
  query GetCountry($countryId: ID!) {
    country(id: $countryId) {
      id
      flagPngSrc
      continent {
        name {
          value
        }
      }
      countryLanguages {
        language {
          name {
            primary
            value
          }
        }
        speakers
      }
    }
  }
`)

export function useCountryQuery(
  variables: GetCountryVariables
): QueryResult<GetCountry, GetCountryVariables> {
  return useQuery<GetCountry, GetCountryVariables>(GET_COUNTRY, {
    variables
  })
}
