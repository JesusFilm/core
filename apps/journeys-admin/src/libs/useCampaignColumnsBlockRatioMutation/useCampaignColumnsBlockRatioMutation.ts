import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignColumnsBlockUpdateRatio,
  CampaignColumnsBlockUpdateRatioVariables
} from '../../../__generated__/CampaignColumnsBlockUpdateRatio'

/** A Columns section's width ratio; its Section Background and colours have their own document. */
export const CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO = gql`
  mutation CampaignColumnsBlockUpdateRatio(
    $id: ID!
    $input: CampaignColumnsBlockUpdateInput!
  ) {
    campaignColumnsBlockUpdate(id: $id, input: $input) {
      id
      ratio
    }
  }
`

export function useCampaignColumnsBlockRatioMutation(
  options?: useMutation.Options<
    CampaignColumnsBlockUpdateRatio,
    CampaignColumnsBlockUpdateRatioVariables
  >
): useMutation.ResultTuple<
  CampaignColumnsBlockUpdateRatio,
  CampaignColumnsBlockUpdateRatioVariables
> {
  return useMutation<
    CampaignColumnsBlockUpdateRatio,
    CampaignColumnsBlockUpdateRatioVariables
  >(CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO, options)
}
