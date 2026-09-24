import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaignJourneyStats,
  GetCampaignJourneyStatsVariables
} from '../../../__generated__/GetCampaignJourneyStats'

// Per-journey all-time visitors/pageviews for the builder's analytics rows.
// `idType: databaseId` because the builder holds journey ids, not slugs.
export const GET_CAMPAIGN_JOURNEY_STATS = gql`
  query GetCampaignJourneyStats(
    $id: ID!
    $where: PlausibleStatsAggregateFilter!
  ) {
    journeysPlausibleStatsAggregate(
      id: $id
      idType: databaseId
      where: $where
    ) {
      visitors {
        value
      }
      pageviews {
        value
      }
    }
  }
`

export function useCampaignJourneyStatsQuery(
  variables?: GetCampaignJourneyStatsVariables,
  options?: { skip?: boolean }
): useQuery.Result<
  GetCampaignJourneyStats,
  GetCampaignJourneyStatsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignJourneyStatsVariables>
> {
  return useQuery<GetCampaignJourneyStats, GetCampaignJourneyStatsVariables>(
    GET_CAMPAIGN_JOURNEY_STATS,
    variables == null || options?.skip === true
      ? skipToken
      : { variables, errorPolicy: 'all' }
  )
}
