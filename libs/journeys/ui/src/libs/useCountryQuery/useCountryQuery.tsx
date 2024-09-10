import { QueryResult, gql, useQuery } from '@apollo/client'

import { GetCountry, GetCountryVariables } from './__generated__/GetCountry'

export const GET_COUNTRY = gql`
  query GetCountry($countryId: ID!) {
    country(id: $countryId) {
      id
      flagPngSrc
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
  variables?: GetCountryVariables
): QueryResult<GetCountry, GetCountryVariables> {
  return useQuery<GetCountry, GetCountryVariables>(GET_COUNTRY, {
    variables
  })
}
