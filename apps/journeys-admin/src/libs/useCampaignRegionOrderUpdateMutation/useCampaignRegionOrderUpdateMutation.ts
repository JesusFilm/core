import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignRegionOrderUpdate,
  CampaignRegionOrderUpdateVariables
} from '../../../__generated__/CampaignRegionOrderUpdate'

export const CAMPAIGN_REGION_ORDER_UPDATE = gql`
  mutation CampaignRegionOrderUpdate($id: ID!, $order: Int!) {
    campaignRegionOrderUpdate(id: $id, order: $order) {
      id
      order
    }
  }
`

/** Move a region; every region's new `order` normalises into its cached row. */
export function useCampaignRegionOrderUpdateMutation(
  options?: useMutation.Options<
    CampaignRegionOrderUpdate,
    CampaignRegionOrderUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignRegionOrderUpdate,
  CampaignRegionOrderUpdateVariables
> {
  return useMutation<
    CampaignRegionOrderUpdate,
    CampaignRegionOrderUpdateVariables
  >(CAMPAIGN_REGION_ORDER_UPDATE, options)
}
