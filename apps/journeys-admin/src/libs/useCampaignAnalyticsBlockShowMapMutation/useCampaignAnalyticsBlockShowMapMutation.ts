import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignAnalyticsBlockUpdateShowMap,
  CampaignAnalyticsBlockUpdateShowMapVariables
} from '../../../__generated__/CampaignAnalyticsBlockUpdateShowMap'

export const CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP = gql`
  mutation CampaignAnalyticsBlockUpdateShowMap(
    $id: ID!
    $input: CampaignAnalyticsBlockUpdateInput!
  ) {
    campaignAnalyticsBlockUpdate(id: $id, input: $input) {
      id
      showMap
    }
  }
`

/** Switch the Analytics section's world map on or off. */
export function useCampaignAnalyticsBlockShowMapMutation(
  options?: useMutation.Options<
    CampaignAnalyticsBlockUpdateShowMap,
    CampaignAnalyticsBlockUpdateShowMapVariables
  >
): useMutation.ResultTuple<
  CampaignAnalyticsBlockUpdateShowMap,
  CampaignAnalyticsBlockUpdateShowMapVariables
> {
  return useMutation<
    CampaignAnalyticsBlockUpdateShowMap,
    CampaignAnalyticsBlockUpdateShowMapVariables
  >(CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP, options)
}
