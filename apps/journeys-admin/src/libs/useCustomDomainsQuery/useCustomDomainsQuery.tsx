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
      routeAllTeamJourneys
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

export function useCustomDomainsQuery(options: {
  variables: GetCustomDomainsVariables
  skip?: boolean
  notifyOnNetworkStatusChange?: boolean
}): useQuery.Result<
  GetCustomDomains,
  GetCustomDomainsVariables,
  'empty' | 'complete' | 'streaming'
> & {
  hostname?: string
} {
  const query = useQuery<GetCustomDomains, GetCustomDomainsVariables>(
    GET_CUSTOM_DOMAINS,
    options
  )

  return { ...query, hostname: query.data?.customDomains[0]?.name }
}
