import { ApolloLink, gql } from '@apollo/client'
import { useApolloClient } from '@apollo/client/react'
import { useCallback } from 'react'

import {
  CampaignAnalyticsBlockUpdateShowMap,
  CampaignAnalyticsBlockUpdateShowMapVariables
} from '../../../__generated__/CampaignAnalyticsBlockUpdateShowMap'
import { GetCampaign_campaign_blocks_CampaignAnalyticsBlock as CampaignAnalyticsBlock } from '../../../__generated__/GetCampaign'

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

/** Whether the Analytics section shows its world map. */
export interface CampaignAnalyticsShowMapInput {
  showMap: boolean
}

export type CampaignAnalyticsShowMapMutate = (
  block: Pick<CampaignAnalyticsBlock, 'id'>,
  input: CampaignAnalyticsShowMapInput
) => Promise<ApolloLink.Result<CampaignAnalyticsBlockUpdateShowMap>>

/**
 * Switch the Analytics section's world map on or off through
 * `campaignAnalyticsBlockUpdate`, shown optimistically.
 */
export function useCampaignAnalyticsBlockShowMapMutation(): CampaignAnalyticsShowMapMutate {
  const client = useApolloClient()
  return useCallback(
    async (block, input) =>
      await client.mutate<
        CampaignAnalyticsBlockUpdateShowMap,
        CampaignAnalyticsBlockUpdateShowMapVariables
      >({
        mutation: CAMPAIGN_ANALYTICS_BLOCK_UPDATE_SHOW_MAP,
        variables: { id: block.id, input },
        optimisticResponse: {
          campaignAnalyticsBlockUpdate: {
            __typename: 'CampaignAnalyticsBlock',
            id: block.id,
            showMap: input.showMap
          }
        }
      }),
    [client]
  )
}
