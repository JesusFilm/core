import { gql } from '@apollo/client';
import { useQuery } from "@apollo/client/react";

import { GetCountry, GetCountryVariables } from './__generated__/GetCountry'

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
  variables: GetCountryVariables
): useQuery.Result<GetCountry, GetCountryVariables> {
  return useQuery<GetCountry, GetCountryVariables>(GET_COUNTRY, {
    variables
  })
}
