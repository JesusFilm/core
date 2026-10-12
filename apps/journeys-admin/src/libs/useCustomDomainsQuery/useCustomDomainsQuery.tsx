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

/**
 * The options are listed out rather than typed as `useQuery.Options`: Apollo
 * Client 4 derives the result's data states from the options it is handed, and
 * a wide `useQuery.Options` leaves `returnPartialData` unresolved — which puts
 * `partial` in the union and hands every caller `DeepPartial` data. Naming the
 * options callers actually pass keeps the result narrowed to complete data.
 */
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
