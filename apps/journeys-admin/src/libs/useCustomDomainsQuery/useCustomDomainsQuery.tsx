import { QueryHookOptions, QueryResult, gql, useQuery } from '@apollo/client'

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
  options?: QueryHookOptions<GetCustomDomains, GetCustomDomainsVariables>
): QueryResult<GetCustomDomains, GetCustomDomainsVariables> & {
  hasCustomDomain: boolean
} {
  const query = useQuery<GetCustomDomains, GetCustomDomainsVariables>(
    GET_CUSTOM_DOMAINS,
    { ...options }
  )

  const hasCustomDomain =
    query.data?.customDomains?.length !== 0 && query.data?.customDomains != null

  return {
    ...query,
    hasCustomDomain
  }
}
