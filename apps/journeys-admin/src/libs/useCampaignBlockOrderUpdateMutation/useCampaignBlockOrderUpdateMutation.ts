import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignBlockOrderUpdate,
  CampaignBlockOrderUpdateVariables
} from '../../../__generated__/CampaignBlockOrderUpdate'
import { campaignBlocksReorder } from '../campaignBlockCache'

export const CAMPAIGN_BLOCK_ORDER_UPDATE = gql`
  mutation CampaignBlockOrderUpdate(
    $id: ID!
    $parentOrder: Int!
    $placement: CampaignChildPlacement
  ) {
    campaignBlockOrderUpdate(
      id: $id
      parentOrder: $parentOrder
      placement: $placement
    ) {
      id
      parentOrder
      ... on CampaignTypographyBlock {
        placement
      }
      ... on CampaignButtonBlock {
        placement
      }
    }
  }
`

/**
 * Move a block among its siblings: the API returns the renumbered siblings
 * (an Extra that crossed the Section Body with its new placement), which go
 * back onto the cached rows so the canvas re-trees without a refetch.
 */
export function useCampaignBlockOrderUpdateMutation(
  options?: useMutation.Options<
    CampaignBlockOrderUpdate,
    CampaignBlockOrderUpdateVariables
  >
): useMutation.ResultTuple<
  CampaignBlockOrderUpdate,
  CampaignBlockOrderUpdateVariables
> {
  return useMutation<
    CampaignBlockOrderUpdate,
    CampaignBlockOrderUpdateVariables
  >(CAMPAIGN_BLOCK_ORDER_UPDATE, {
    update(cache, { data }) {
      if (data?.campaignBlockOrderUpdate == null) return
      campaignBlocksReorder(cache, data.campaignBlockOrderUpdate)
    },
    ...options
  })
}
