import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import {
  CampaignBlockDelete,
  CampaignBlockDeleteVariables
} from '../../../__generated__/CampaignBlockDelete'
import { campaignBlockDeleteUpdate } from '../campaignBlockCache'

export const CAMPAIGN_BLOCK_DELETE = gql`
  mutation CampaignBlockDelete($id: ID!) {
    campaignBlockDelete(id: $id) {
      id
      parentOrder
    }
  }
`

/**
 * Soft-delete a block: drop it from the campaign's cached block list and
 * write the renumbered siblings the API returns. The row stays cached so
 * `campaignBlockRestore` can bring it straight back.
 */
export function useCampaignBlockDeleteMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignBlockDelete,
    CampaignBlockDeleteVariables
  >
): useMutation.ResultTuple<CampaignBlockDelete, CampaignBlockDeleteVariables> {
  return useMutation<CampaignBlockDelete, CampaignBlockDeleteVariables>(
    CAMPAIGN_BLOCK_DELETE,
    {
      update(cache, { data }, { variables }) {
        if (variables?.id == null) return
        campaignBlockDeleteUpdate(
          cache,
          campaignId,
          variables.id,
          data?.campaignBlockDelete
        )
      },
      ...options
    }
  )
}
