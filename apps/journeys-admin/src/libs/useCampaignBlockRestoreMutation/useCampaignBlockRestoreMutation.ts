import { gql } from '@apollo/client'
import { useMutation } from '@apollo/client/react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'

import {
  CampaignBlockRestore,
  CampaignBlockRestoreVariables
} from '../../../__generated__/CampaignBlockRestore'
import { campaignBlockRestoreUpdate } from '../campaignBlockCache'

export const CAMPAIGN_BLOCK_RESTORE = gql`
  ${CAMPAIGN_PUBLIC_BLOCK_FIELDS}
  mutation CampaignBlockRestore($id: ID!) {
    campaignBlockRestore(id: $id) {
      ...CampaignPublicBlockFields
    }
  }
`

/**
 * Restore a soft-deleted block: the API returns the block, its renumbered
 * siblings and its descendants, all of which go back into the campaign's
 * cached block list.
 */
export function useCampaignBlockRestoreMutation(
  campaignId: string,
  options?: useMutation.Options<
    CampaignBlockRestore,
    CampaignBlockRestoreVariables
  >
): useMutation.ResultTuple<
  CampaignBlockRestore,
  CampaignBlockRestoreVariables
> {
  return useMutation<CampaignBlockRestore, CampaignBlockRestoreVariables>(
    CAMPAIGN_BLOCK_RESTORE,
    {
      update(cache, { data }) {
        campaignBlockRestoreUpdate(
          cache,
          campaignId,
          data?.campaignBlockRestore
        )
      },
      ...options
    }
  )
}
