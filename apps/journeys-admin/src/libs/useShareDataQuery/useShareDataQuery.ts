import { QueryHookOptions, QueryResult, gql, useQuery } from '@apollo/client'

import {
  ShareDataQuery,
  ShareDataQueryVariables
} from '../../../__generated__/ShareDataQuery'

/**
 * GraphQL query to fetch journey details with related team and custom domain information,
 * as well as any associated QR codes. Used for sharing and embedding functionality.
 */
export const SHARE_DATA_QUERY = gql`
  query ShareDataQuery($id: ID!, $qrCodeWhere: QrCodesFilter!) {
    journey(id: $id) {
      id
      slug
      title
      team {
        id
        customDomains {
          id
          name
          apexName
          routeAllTeamJourneys
        }
      }
    }
    qrCodes(where: $qrCodeWhere) {
      id
      toJourneyId
      shortLink {
        id
        pathname
        to
        domain {
          hostname
        }
      }
    }
  }
`

/**
 * Hook to fetch share-related data for a journey, including custom domains and QR codes
 * Uses generated types from the GraphQL schema for type safety
 */
export function useShareDataQuery(
  options?: QueryHookOptions<ShareDataQuery, ShareDataQueryVariables>
): QueryResult<ShareDataQuery, ShareDataQueryVariables> {
  const query = useQuery<ShareDataQuery, ShareDataQueryVariables>(
    SHARE_DATA_QUERY,
    options
  )

  return query
}
