import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'

import {
  GetCustomDomains,
  GetCustomDomainsVariables
} from '../../../__generated__/GetCustomDomains'

export const GET_CUSTOM_DOMAINS = gql`
  query GetCustomDomains($teamId: ID!) {
    customDomains(teamId: $teamId) {
      id
      apexName
      name
      journeyCollection {
        id
        journeys {
          title
          id
        }
      }
    }
  }
`

export function useCustomDomainsQuery(
  options?: useQuery.Options<GetCustomDomains, GetCustomDomainsVariables>
): useQuery.Result<GetCustomDomains, GetCustomDomainsVariables> & {
  hostname?: string
} {
  const query = useQuery<GetCustomDomains, GetCustomDomainsVariables>(
    GET_CUSTOM_DOMAINS,
    options
  )

  return { ...query, hostname: query.data?.customDomains[0]?.name }
}
