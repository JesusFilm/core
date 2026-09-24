import { gql } from '@apollo/client'
import { skipToken, useQuery } from '@apollo/client/react'

import {
  GetCampaignCountryStats,
  GetCampaignCountryStatsVariables
} from '../../../__generated__/GetCampaignCountryStats'

// Authenticated country breakdown for the builder's analytics panel. Lives on
// the full `Campaign` type (not the public slug query) so it works for drafts.
// It is a live Plausible read, so it is a separate query from the campaign
// read and only requested where the panel renders.
export const GET_CAMPAIGN_COUNTRY_STATS = gql`
  query GetCampaignCountryStats($id: ID!) {
    campaign(id: $id) {
      id
      countryStats {
        from
        to
        totalVisitors
        totalPageviews
        countries {
          countryCode
          countryName
          visitors
          pageviews
        }
      }
    }
  }
`

export function useCampaignCountryStatsQuery(
  variables?: GetCampaignCountryStatsVariables,
  options?: { skip?: boolean }
): useQuery.Result<
  GetCampaignCountryStats,
  GetCampaignCountryStatsVariables,
  'empty' | 'complete' | 'streaming',
  Partial<GetCampaignCountryStatsVariables>
> {
  return useQuery<GetCampaignCountryStats, GetCampaignCountryStatsVariables>(
    GET_CAMPAIGN_COUNTRY_STATS,
    variables == null || options?.skip === true
      ? skipToken
      : { variables, errorPolicy: 'all' }
  )
}
