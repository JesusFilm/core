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

export function useCustomDomainsQuery(
  options?: QueryHookOptions<GetCustomDomains, GetCustomDomainsVariables>
): QueryResult<GetCustomDomains, GetCustomDomainsVariables> & {
  /**
   * Convenience accessor for `customDomains[0]?.name`. Used by share-link /
   * preview / QR / copy-link surfaces that want "this team's custom
   * domain" — typically one. DOES NOT reflect routeAll semantics: a team
   * with two custom domains where only the second has
   * `routeAllTeamJourneys === true` will still get the first one's name
   * here. For routeAll checks (e.g. the gallery publish gate) iterate
   * `data.customDomains` directly — see `useCanPublishCollection`.
   */
  primaryHostname?: string
} {
  const query = useQuery<GetCustomDomains, GetCustomDomainsVariables>(
    GET_CUSTOM_DOMAINS,
    options
  )

  return { ...query, primaryHostname: query.data?.customDomains[0]?.name }
}
