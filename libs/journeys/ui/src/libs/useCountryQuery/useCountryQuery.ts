import { QueryResult, gql, useQuery } from '@apollo/client'

import {
  GetCountryQuery,
  GetCountryQueryVariables
} from './__generated__/useCountryQuery'

export const GET_COUNTRY = gql`
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
`

export function useCountryQuery(
  variables: GetCountryQueryVariables
): QueryResult<GetCountryQuery, GetCountryQueryVariables> {
  return useQuery<GetCountryQuery, GetCountryQueryVariables>(GET_COUNTRY, {
    variables
  })
}
