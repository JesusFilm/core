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
      verification {
        verified
        verification {
          domain
          reason
          type
          value
        }
      }
      configuration {
        misconfigured
      }
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
  customDomainVerified: boolean
} {
  const query = useQuery<GetCustomDomains, GetCustomDomainsVariables>(
    GET_CUSTOM_DOMAINS,
    { ...options }
  )

  const customDomainVerified =
    query.data?.customDomains[0]?.name != null &&
    query.data?.customDomains[0]?.verification?.verified === true

  const hasCustomDomain =
    query.data?.customDomains?.length !== 0 && query.data?.customDomains != null

  return {
    ...query,
    hasCustomDomain,
    customDomainVerified
  }
}
